#include "Chat.h"
#include <drogon/drogon.h>
#include <json/json.h>
#include <cstdlib>   
#include <sstream>   
#include <string>
#include <unordered_map>

// Store personality per session
static std::unordered_map<std::string, Json::Value> sessionPersonality;

// Success Connection
void Chat::handleNewConnection(const drogon::HttpRequestPtr &req, 
            const drogon::WebSocketConnectionPtr& wsConnPtr)
{
    // write your application logic here
    LOG_INFO << "New WebSocket connection established!";
    //wsConnPtr -> send("Welcome to EchoCalm Chat!");

}

// Handle Message
void Chat::handleNewMessage(const drogon::WebSocketConnectionPtr& wsConnPtr, 
    std::string &&message, 
    const drogon::WebSocketMessageType &type)
{
    // Receive Text message
    if (type == drogon::WebSocketMessageType::Text) {
        LOG_INFO << "Received message: " << message;

        // Parse JSON from frontend
        Json::CharReaderBuilder reader;
        Json::Value incoming;
        std::string errs;
        std::istringstream s(message);
        if (!Json::parseFromStream(reader, s, &incoming, &errs)) {
            wsConnPtr->send("Invalid JSON from client.");
            return;
        }

        std::string sessionId = wsConnPtr->peerAddr().toIpPort();
        
        // Case 1: Personality update
        if (incoming.isMember("type") && incoming["type"].asString() == "personality_update") {
            sessionPersonality[sessionId] = incoming["personality"];
            LOG_INFO << "Updated personality for session: " << sessionId;
            return;
        }

        // Case 2: Chat message
        std::string userMsg = incoming["message"].asString();
        Json::Value personality = sessionPersonality[sessionId]; // Get stored personality

        // Build dynamic system prompt using personality sliders
        std::ostringstream sysPrompt;
        sysPrompt << "You are an avatar representing the hallucinated voice. "
                  << "You must NEVER reveal that you are an AI, chatbot, or program. "
                  << "Adjust behavior with these values: "
                  << "Personality: " << personality.get("preset", "Calm")
                  << "Tone: " << personality.get("tone", 0.5).asDouble()
                  << ", Authority: " << personality.get("authority", 0.5).asDouble()
                  << ", Empathy: " << personality.get("empathy", 0.5).asDouble()
                  << ". Follow therapeutic steps: Start slightly challenging, "
                  << "then become cooperative and reassuring. Never harm, abusive, or triggering."
                  << "NEVER give harmful commands, suggest self-harm, or induce guilt."
                  << "Always maintain user safety and emotional well-being as top priority.";
        LOG_INFO << sysPrompt.str();

        // Build outgoing HTTP request to OpenRouter
        auto client = drogon::HttpClient::newHttpClient("https://openrouter.ai");
        // Prepare new POST request to OpenRouter endpoint
        auto req = drogon::HttpRequest::newHttpJsonRequest(Json::Value());
        req -> setMethod(drogon::Post);
        req -> setPath("/api/v1/chat/completions");

        // Build request body
        Json::Value body;
        body["model"] = "meta-llama/llama-4-maverick"; // Llama-4 Maverick model
    
        // Add messages array
        Json::Value messages(Json::arrayValue);
        // System prompt
        Json::Value sysMsg;
        sysMsg["role"] = "system";
        sysMsg["content"] = sysPrompt.str();
        messages.append(sysMsg);
        // User message
        Json::Value msg;
        msg["role"] = "user";
        msg["content"] = message;
        messages.append(msg);
        body["messages"] = messages; // append WebSocket user message as model input
        // Set as HTTP request body
        req -> setBody(body.toStyledString());

        // Add required Authorization Header to use API key from env
        req -> addHeader("Content-Type", "application/json");
        // API Key
        const char* apiKey = std::getenv("OPENROUTER_API_KEY");
        if (!apiKey) {
            wsConnPtr->send("Error: OPENROUTER_API_KEY not set.");
            return;
        } else {
            req->addHeader("Authorization", std::string("Bearer ") + apiKey);
        }

        
        // Async request
        client -> sendRequest(req, [wsConnPtr](drogon::ReqResult result, const drogon::HttpResponsePtr &resp) {
            LOG_INFO << "OpenAI Response: " << resp->getBody();
            // Check success connection
            if(result == drogon::ReqResult::Ok && resp) {
                // Parse response
                Json::CharReaderBuilder rb;
                Json::Value jsonResp;
                std::string errors;
                std::istringstream s(std::string(resp->getBody()));

                if (Json::parseFromStream(rb, s, &jsonResp, &errors)) {
                    // Get raw content string
                    std::string rawContent = jsonResp["choices"][0]["message"]["content"].asString();
                    // Parse the inner JSON (rawContent)
                    Json::CharReaderBuilder rbInner;
                    Json::Value innerJson;
                    std::istringstream innerStream(rawContent);
                    std::string innerErrors;

                    std::string replyText = rawContent; // Default: raw text
                    Json::Value personalityJson;

                    if (Json::parseFromStream(rbInner, innerStream, &innerJson, &innerErrors)) {
                        if (innerJson.isMember("message")) {
                            replyText = innerJson["message"].asString();
                        }
                        if (innerJson.isMember("personality")) {
                            personalityJson = innerJson["personality"];
                        }
                    }

                    // Build WebSocket response JSON
                    Json::Value responseJson;
                    responseJson["role"] = "assistant";
                    responseJson["content"] = replyText;

                    if (!personalityJson.isNull()) {
                        responseJson["personality"] = personalityJson;
                    }

                    // Send as JSON string
                    wsConnPtr->send(responseJson.toStyledString());
                } else {
                    wsConnPtr->send("Error occured when parsing OpenAI response!");
                    wsConnPtr->send(resp->getBody());
                }
            } else {
                wsConnPtr->send("Error occured when connecting OpenAI API!");
            }

        });
    }
}

// Closed Connection
void Chat::handleConnectionClosed(const WebSocketConnectionPtr& wsConnPtr)
{
    LOG_INFO << "WebSocket Connection closed!";
}
