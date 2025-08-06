#pragma once
#include <drogon/WebSocketController.h>
using namespace drogon;

class Chat : public drogon::WebSocketController<Chat>
{
  public:
     Chat() = default; 
     void handleNewMessage(const WebSocketConnectionPtr &conn,
                                  std::string &&message,
                                  const WebSocketMessageType &type) override;
    void handleNewConnection(const HttpRequestPtr &,
                             const WebSocketConnectionPtr &conn) override;
    void handleConnectionClosed(const WebSocketConnectionPtr &conn) override;
    WS_PATH_LIST_BEGIN
    // list path definitions here;
    // WS_PATH_ADD("/path", "filter1", "filter2", ...);
    WS_PATH_ADD("/chat"); // WebSocket endpoint for AI chat
    WS_PATH_LIST_END
};
