
import jakarta.websocket.Session
import com.fasterxml.jackson.annotation.JsonCreator



data class UserSession(val username: String, val session: Session)

data class Message @JsonCreator constructor(val sender: String, val type: String, val content: String)