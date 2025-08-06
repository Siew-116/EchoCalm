#include "Profile.h"
#include <drogon/WebSocketConnection.h>
#include <fstream>
#include <json/json.h>

using namespace drogon;

void Profile::handleNewMessage(const WebSocketConnectionPtr &conn,
                                std::string &&message,
                                const WebSocketMessageType &) {
    Json::Value msg;
    Json::CharReaderBuilder reader;
    std::string errs;

    std::istringstream s(message);
    if (!Json::parseFromStream(reader, s, &msg, &errs)) {
        Json::Value error;
        error["status"] = "error";
        error["message"] = "Invalid JSON";
        conn->send(Json::writeString(Json::StreamWriterBuilder(), error));
        return;
    }
    std::string filepath = "C:\\EchoCalm\\echocalm-backend\\data\\users.json";
    std::string action = msg["action"].asString();
    std::ifstream ifs(filepath);
    Json::Value users;
    ifs >> users;
    ifs.close();

    if (action == "get_all_users") {
        Json::Value res;
        res["status"] = "success";
        res["action"] = "all_users";
        res["users"] = users;
        conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
    }

    else if (action == "update_user") {
        std::string oldUsername = msg["oldUsername"].asString();
        std::string newUsername = msg["newUsername"].asString();

        if (!users.isMember(oldUsername)) {
            Json::Value res;
            res["status"] = "error";
            res["message"] = "Old username not found";
            conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
            return;
        }

        if (users.isMember(newUsername)) {
            Json::Value res;
            res["status"] = "error";
            res["message"] = "New username already exists";
            conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
            return;
        }

        users[newUsername] = users[oldUsername];
        users.removeMember(oldUsername);

        std::ofstream ofs(filepath);
        ofs << users;
        ofs.close();

        Json::Value res;
        res["status"] = "success";
        res["action"] = "update_user";
        res["oldUsername"] = oldUsername;
        res["newUsername"] = newUsername;
        conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
    }

    else if (action == "update_password") {
        std::string username = msg["username"].asString();
        std::string password = msg["password"].asString();

        if (!users.isMember(username)) {
            Json::Value res;
            res["status"] = "error";
            res["message"] = "Username not found";
            conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
            return;
        }

        users[username]["password"] = password;

        std::ofstream ofs(filepath);
        ofs << users;
        ofs.close();

        Json::Value res;
        res["status"] = "success";
        res["action"] = "update_password";
        conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
    }

    else {
        Json::Value res;
        res["status"] = "error";
        res["message"] = "Unknown request type";
        conn->send(Json::writeString(Json::StreamWriterBuilder(), res));
    }
}

void Profile::handleConnectionClosed(const WebSocketConnectionPtr &conn) {
    LOG_INFO << "Profile WebSocket closed";
}

void Profile::handleNewConnection(const HttpRequestPtr &,
                                  const WebSocketConnectionPtr &conn) {
    LOG_INFO << "New WebSocket connection on /ws/profile";
}
