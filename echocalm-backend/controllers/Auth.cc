#include "Auth.h"
#include <drogon/drogon.h>
#include <fstream>
#include <json/json.h>
#include <random>
#include <string>


std::string generateId(size_t length = 16) {
    const std::string chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dist(0, static_cast<int>(chars.size() - 1));

    std::string id;
    for (size_t i = 0; i < length; ++i) {
        id += chars[dist(gen)];
    }
    return id;
}

void Auth::handleNewMessage(const WebSocketConnectionPtr& wsConnPtr, std::string &&message, const WebSocketMessageType &type)
{
    Json::Value response;
    Json::Reader reader;
    Json::Value parsed;

    if (message.empty() || message == "\"\"") {
        LOG_INFO << "Ignore stray messages. Message content: [" << message << "]";
        return;
    }
    
    if (!reader.parse(message, parsed)) {
        response["status"] = "error";
        response["message"] = "Invalid JSON";
        wsConnPtr->send(Json::FastWriter().write(response));
        return;
    }
    

    if (!parsed.isMember("action") || !parsed.isMember("username") || !parsed.isMember("password")) {
        response["status"] = "error";
        response["message"] = "Missing fields";
        wsConnPtr->send(Json::FastWriter().write(response));
        return;
    } else if (parsed.isMember("type") && parsed["type"].asString() == "connected") {
        LOG_INFO << "Received connection confirmation message, ignoring.";
        return;
    }

    std::string action = parsed["action"].asString();
    std::string username = parsed["username"].asString();
    std::string password = parsed["password"].asString();

    // Use escaped backslashes or forward slashes
    std::string filepath = "C:\\EchoCalm\\echocalm-backend\\data\\users.json";
    Json::Value users;

    // Try opening and reading existing file
    std::ifstream inFile(filepath);
    if (inFile.good()) {
        if (!reader.parse(inFile, users)) {
            users.clear(); // Reset if file content is invalid
        }
    }
    inFile.close();


    if (action == "update_user") {
        if (!parsed.isMember("oldUsername") || !parsed.isMember("newUsername") || !parsed.isMember("password")) {
            response["status"] = "error";
            response["message"] = "Missing fields for update";
            wsConnPtr->send(Json::FastWriter().write(response));
            return;
        }

        std::string oldUsername = parsed["oldUsername"].asString();
        std::string newUsername = parsed["newUsername"].asString();
        std::string password = parsed["password"].asString();

        if (!users.isMember(oldUsername)) {
            response["status"] = "error";
            response["message"] = "Old username does not exist";
        } else if (users.isMember(newUsername) && oldUsername != newUsername) {
            response["status"] = "error";
            response["message"] = "New username already exists";
        } else {
            // Move user data
            users[newUsername]["password"] = password;
            if (oldUsername != newUsername) {
                users.removeMember(oldUsername);
            }

            std::ofstream outFile(filepath);
            if (!outFile) {
                response["status"] = "error";
                response["message"] = "Failed to write to file";
                wsConnPtr->send(Json::FastWriter().write(response));
                return;
            }

            outFile << Json::StyledWriter().write(users);
            outFile.close();

            response["status"] = "success";
            response["message"] = "User updated";
        }

        wsConnPtr->send(Json::FastWriter().write(response));
        return;
    }

    bool userExists = users.isMember(username);

    if (action == "login") {
        if (userExists && users[username]["password"].asString() == password) {
            response["status"] = "success";
            response["message"] = "Login successful";
            response["userId"] = users[username]["userId"].asString();
        } else {
            response["status"] = "error";
            response["message"] = "Invalid credentials";
        }
    } else if (action == "signup") {
        if (userExists) {
            response["status"] = "error";
            response["message"] = "User already exists";
        } else {
            // Generate userId
            std::string userId = generateId(16);

            // Save user with password and userId
            users[username]["userId"] = userId;
            users[username]["password"] = password;

            // Write to file
            std::ofstream outFile(filepath);
            if (!outFile) {
                response["status"] = "error";
                response["message"] = "Failed to save user data";
                wsConnPtr->send(Json::FastWriter().write(response));
                return;
            }

            outFile << Json::StyledWriter().write(users);
            outFile.close();

            response["status"] = "success";
            response["message"] = "Signup successful";
            response["userId"] = userId;
        }
    } 
    else {
        response["status"] = "error";
        response["message"] = "Unknown action";
    }

    wsConnPtr->send(Json::FastWriter().write(response));

    
}

void Auth::handleNewConnection(const HttpRequestPtr &req, const WebSocketConnectionPtr& wsConnPtr)
{
   LOG_INFO << "New WebSocket auth connection";

    Json::Value jsonMsg;
    jsonMsg["type"] = "connected";
    jsonMsg["message"] = "Auth WebSocket connection established";

    Json::StreamWriterBuilder builder;
    std::string jsonStr = Json::writeString(builder, jsonMsg);

    wsConnPtr->send(jsonStr);
}

void Auth::handleConnectionClosed(const WebSocketConnectionPtr& wsConnPtr)
{
     LOG_INFO << "WebSocket auth connection closed";

}
