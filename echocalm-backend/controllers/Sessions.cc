#include "Sessions.h"
#include <fstream>
#include <filesystem>
#include <json/json.h>

void Sessions::handleNewMessage(const WebSocketConnectionPtr& wsConnPtr, std::string &&message, const WebSocketMessageType &type)
{
    LOG_INFO << "[session.cc]handleNewMessage triggered with message: " << message;
    Json::Value root;
    Json::CharReaderBuilder builder;
    std::string errs;
    static std::unordered_map<std::string, Json::Value> lastSavedSessionMap;

    std::istringstream ss(message);
    if (!Json::parseFromStream(builder, ss, &root, &errs)) {
        wsConnPtr->send(R"({"status": "error", "message": "Invalid JSON"})");
        return;
    }

    std::string action = root.get("action", "").asString();

    if (action == "save_session") {
        Json::Value data = root["data"];
        std::string username = data.get("username", "").asString();
        std::string id = data.get("id", "").asString();

        if (username.empty()) {
            wsConnPtr->send(R"({"status": "error", "message": "Username missing"})");
            return;
        }
        
        LOG_DEBUG << "Received username: [" << username << "]";
        std::string basePath = "C:/EchoCalm/echocalm-backend/data/sessions";
        std::filesystem::create_directories(basePath);
        std::string path = basePath + "/" + id + ".json";

        // Load existing sessions
        Json::Value sessionList;
        std::ifstream inFile(path);
        if (inFile.good()) {
            inFile >> sessionList;
        }
        inFile.close();
       
        // Check if session is duplicate
        if (lastSavedSessionMap[username] == data) {
            LOG_INFO << "Duplicate session detected for " << username << ", skipping save.";
            wsConnPtr->send(R"({"status": "success", "message": "Duplicate session ignored"})");
            return;
        }

        // Save session and update cache
        lastSavedSessionMap[username] = data;
        sessionList.append(data);
        LOG_DEBUG << "Attempting to write to: " << path;

        // Convert to string
        Json::StreamWriterBuilder writer;
        std::string jsonStr = Json::writeString(writer, sessionList);

        // Save back to file
        std::ofstream outFile(path);
        if (!outFile) {
            LOG_ERROR << "Could not open file: " << path;
            wsConnPtr->send(R"({"status": "error", "message": "Could not save session"})");
        } else {
            outFile << jsonStr;
            outFile.close();
            LOG_INFO << "Successfully wrote session: " << path;
            wsConnPtr->send(R"({"status": "success", "message": "Session saved"})");
        }
        
    }
    else if (action == "load_sessions") {
        std::string id = root.get("id", "").asString();
        if (id.empty()) {
            wsConnPtr->send(R"({"status": "error", "message": "User ID missing"})");
            return;
        }

        std::string basePath = "C:/EchoCalm/echocalm-backend/data/sessions";
        std::filesystem::create_directories(basePath);
        std::string path = basePath + "/" + id + ".json";
        Json::Value sessionList;
        std::ifstream inFile(path);
        if (inFile.good()) {
            Json::CharReaderBuilder builder;
            builder["collectComments"] = false;
            std::string errs;
            bool ok = Json::parseFromStream(builder, inFile, &sessionList, &errs);
            if (!ok) {
                LOG_ERROR << "Failed to parse session file: " << errs;
            }
        }
        inFile.close();

        Json::Value response;
        response["status"] = "success";
        response["sessions"] = sessionList;

        Json::StreamWriterBuilder writer;
        std::string responseStr = Json::writeString(writer, response);
        wsConnPtr->send(responseStr);
    }
    else if (action == "delete_session") {
    std::string sessionId = root.get("sessionId", "").asString();
    std::string userId = root.get("userId", "").asString();

    if (sessionId.empty() || userId.empty()) {
        wsConnPtr->send(R"({"status": "error", "message": "Missing sessionId or userId"})");
        return;
    }

    std::string basePath = "C:/EchoCalm/echocalm-backend/data/sessions";
    std::string path = basePath + "/" + userId + ".json";
    Json::Value sessionList;

    std::ifstream inFile(path);
    if (inFile.good()) {
        inFile >> sessionList;
        inFile.close();

        Json::Value updatedList(Json::arrayValue);
        bool found = false;

        for (const auto& session : sessionList) {
            if (session["sessionId"].asString() != sessionId) {
                updatedList.append(session);
            } else {
                found = true;
            }
        }

        if (!found) {
            wsConnPtr->send(R"({"status": "error", "message": "Session not found"})");
            return;
        }

        std::ofstream outFile(path);
        if (!outFile) {
            wsConnPtr->send(R"({"status": "error", "message": "Failed to open session file"})");
            return;
        }

        Json::StreamWriterBuilder writer;
        outFile << Json::writeString(writer, updatedList);
        outFile.close();

        wsConnPtr->send(R"({"status": "success", "message": "Session deleted"})");
        return;
    } else {
        wsConnPtr->send(R"({"status": "error", "message": "Session file not found"})");
    }
}
}

void Sessions::handleNewConnection(const HttpRequestPtr &req, const WebSocketConnectionPtr& wsConnPtr)
{
    LOG_INFO << "New WebSocket connection on /ws/sessions";
}

void Sessions::handleConnectionClosed(const WebSocketConnectionPtr& wsConnPtr)
{
    LOG_INFO << "Session WebSocket closed";
}
