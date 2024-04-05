import jakarta.websocket.*
import jakarta.websocket.server.ServerEndpoint
import jakarta.websocket.server.PathParam
import org.slf4j.LoggerFactory
import io.vertx.core.json.Json
import com.fasterxml.jackson.annotation.JsonCreator
import UserSession
import Message



@ServerEndpoint("/game/{gameName}/{username}")
class GameSocket {

    companion object {
        private val games = mutableMapOf<String, MutableList<UserSession>>()
    }

    private val logger = LoggerFactory.getLogger(GameSocket::class.java)

    @OnOpen
    fun onOpen(session: Session, @PathParam("gameName") gameName: String, @PathParam("username") username: String) {
        val userSession = UserSession(username, session)
        val gameSessions = games.getOrPut(gameName) { mutableListOf() }
        gameSessions.add(userSession)
        val message = "A new session has been opened for game: $gameName by user: $username"
        logger.info(message)
        broadcastUserList(gameSessions)
        logAllGames()
    }

    @OnClose
    fun onClose(session: Session, @PathParam("gameName") gameName: String) {
        val gameSessions = games[gameName]
        val userSession = gameSessions?.find { it.session == session }
        if (userSession != null) {
            gameSessions.remove(userSession)
            logger.info("A session has been closed for game: $gameName by user: ${userSession.username}")
    
            // Broadcast the updated user list
            broadcastUserList(gameSessions)
        }
        if (gameSessions?.isEmpty() == true) {
            games.remove(gameName)
            logger.info("All sessions for game: $gameName have been closed. The game has been removed.")
        }
        logAllGames()
    }

    @OnMessage
    fun onMessage(session: Session, message: String, @PathParam("gameName") gameName: String) {
        logger.info("Received raw message: $message")
        val decodedMessage = Json.decodeValue(message, Message::class.java)
        logger.info("Received message: $decodedMessage")
        val gameSessions = games[gameName]
        if (gameSessions != null) {
            broadcastMessage(gameSessions, message, session)
        }
    }
    
    private fun broadcastMessage(sessions: List<UserSession>, message: String, session: Session) {
        sessions.forEach { userSession ->
            if (userSession.session !== session) {
                userSession.session.asyncRemote.sendText(message)
            }
        }
    }


    private fun broadcastUserList(gameSessions: MutableList<UserSession>) {
        val usernames = gameSessions.map { it.username }
        val updateMessage = Json.encode(usernames)
        gameSessions.forEach { userSession ->
            userSession.session.asyncRemote.sendText(updateMessage)
        }
    }

    private fun logAllGames() {
        games.forEach { (gameName, userSessions) ->
            logger.info("Game: $gameName")
            userSessions.forEach { userSession ->
                logger.info("Session ID: ${userSession.session.id}, Username: ${userSession.username}")
            }
        }
    }
}