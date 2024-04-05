import jakarta.websocket.*
import jakarta.websocket.server.ServerEndpoint
import jakarta.websocket.server.PathParam
import org.slf4j.LoggerFactory
import io.vertx.core.json.Json
import com.fasterxml.jackson.annotation.JsonCreator
import UserSession
import Message


@ServerEndpoint("/user/{username}")
class UserSocket {

    companion object {
        private val sessions = mutableListOf<UserSession>()
    }

    private val logger = LoggerFactory.getLogger(UserSocket::class.java)

    @OnOpen
    fun onOpen(session: Session, @PathParam("username") username: String) {
        if (isUsernameTaken(username)) {
            val jsonErrorMessage = Json.encode(Message("server", "error", "username already in use"))
            session.asyncRemote.sendText(jsonErrorMessage)
            session.close()
        } else {
            val userSession = UserSession(username, session)
            sessions.add(userSession)
            val message = "A new session has been opened by user: $username"
            logger.info(message)
            broadcastUserList()
            logAllSessions()
        }
    }

    private fun isUsernameTaken(username: String): Boolean {
        return sessions.any { it.username == username }
    }

    @OnClose
    fun onClose(session: Session) {
        val userSession = sessions.find { it.session == session }
        if (userSession != null) {
            sessions.remove(userSession)
            logger.info("A session has been closed by user: ${userSession.username}")
            broadcastUserList()
        }
        logAllSessions()
    }

    @OnMessage
    fun onMessage(session: Session, message: String) {
        logger.info("Received raw message: $message")
        val decodedMessage = Json.decodeValue(message, Message::class.java)
        logger.info("Received message: $decodedMessage")
        
        broadcastMessage(message, session)
    }
    
    private fun broadcastMessage(message: String, session: Session) {
        sessions.forEach { userSession ->
            if (userSession.session !== session) {
                userSession.session.asyncRemote.sendText(message)
            }
        }
    }


    private fun broadcastUserList() {
        val usernames = sessions.map { it.username }
        val usernamesString = usernames.joinToString(", ")
        val updateMessage = Message("server", "users", usernamesString)
        val jsonUpdateMessage = Json.encode(updateMessage)
        sessions.forEach { userSession ->
            userSession.session.asyncRemote.sendText(jsonUpdateMessage)
        }
    }

    private fun logAllSessions() {
        sessions.forEach { userSession ->
            logger.info("Session ID: ${userSession.session.id}, Username: ${userSession.username}")
        }
    }
}