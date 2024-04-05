package schaedler

import com.arjuna.ats.jbossatx.logging.jbossatxLogger.logger
import com.fasterxml.jackson.databind.ObjectMapper
import io.smallrye.common.annotation.Blocking
import jakarta.enterprise.context.ApplicationScoped
import jakarta.websocket.*
import jakarta.websocket.server.ServerEndpoint
import jakarta.websocket.server.PathParam


@ApplicationScoped
@ServerEndpoint("/chat/{username}")
class StartWebSocket {

    private val sessions = mutableSetOf<Session>()
    private val sessionUsernames = mutableMapOf<Session, String>()


    @OnOpen
    fun onOpen(session: Session, @PathParam("username") username: String) {
    sessions.add(session)
    sessionUsernames[session] = username
    val sessionInfo  = ObjectMapper().writeValueAsString(
        mapOf(
            "type" to "sessionUpdate",
            "sessionId" to session.id,
            "isOpen" to true,
            "existingSessions" to sessions.map { it.id },
            "existingUsers" to sessionUsernames.values.toList(),
            "username" to username
        )
    )
    val message = mapOf("type" to "sessionUpdate", "sessionInfo" to sessionInfo)

    try {
        // Broadcast the session update to all connected users
        sessions.forEach { otherSession ->
            otherSession.asyncRemote.sendText(ObjectMapper().writeValueAsString(message))
        }

        logger.info("New session opened: ${session.id} for user: $username")
        logger.info("Existing sessions: ${sessions.map { it.id }}")
    } catch (error: Exception) {
        logger.error("Error sending message: $error")
    }
}

    @OnMessage
    fun onMessage(message: String, session: Session) {
        logger.info("Message received---: $message")
        try {
            // Parse incoming JSON message using Jackson
            val mapper = ObjectMapper()
            val jsonNode = mapper.readTree(message)

            // Extract sender and content from JSON
            val sender = jsonNode["sender"]?.asText() ?: ""
            val content = jsonNode["content"]?.asText() ?: ""
            val type = jsonNode["type"]?.asText() ?: ""


            openGame(type, content)


            // Create a Message object
            val messageObject = Message(sender, type, content)

            // Convert Message object to JSON string using Jackson
            val jsonResponse = mapper.writeValueAsString(messageObject)

            logger.info("Message received: $jsonResponse")

            // Send the JSON string to all other sessions
            sessions.forEach { otherSession ->
                if (otherSession !== session) {
                    otherSession.basicRemote.sendText(jsonResponse)
                }
            }
        } catch (e: Exception) {
            println("Error processing message: $e")
        }
    }

    fun openGame(type: String, content: String) {
        if (type == "openGame") {
            logger.info("Game opened: $content")
        }
    }

    @OnClose
    fun onClose(session: Session) {
        val username = sessionUsernames[session]
        
        sessions.remove(session)
        sessionUsernames.remove(session)

        val disconnectedMessage = mapOf(
            "type" to "sessionUpdate",
            "sessionId" to session.id,
            "isOpen" to false,
            "existingSessions" to sessions.map { it.id },
            "existingUsers" to sessionUsernames.values.toList(),
            "disconnectedUsername" to username
        )

        try {
            // Broadcast the disconnection message to all connected users
            sessions.forEach { otherSession ->
                otherSession.asyncRemote.sendText(ObjectMapper().writeValueAsString(disconnectedMessage))
            }

            logger.info("Session ${session.id} closed for user: $username")
            logger.info("Remaining sessions: ${sessions.map { it.id }}")
        } catch (error: Exception) {
            logger.error("Error broadcasting disconnection message: $error")
        }
    }

    @OnError
    fun onError(error: Throwable, session: Session) {
        logger.error("Error in session ${session.id}: $error")
    }

    data class Message(val sender: String, val type: String, val content: String)
}


