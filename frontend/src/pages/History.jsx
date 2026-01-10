import { useEffect, useState } from "react";
import { MessageService } from "../services/message.service";

export default function History() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    MessageService.getAll().then(setMessages);
  }, []);

  return (
    <div>
      <h1>Historique</h1>

      <table>
        <thead>
          <tr>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => (
            <tr key={m._id}>
              <td>{m.content}</td>
              <td>{m.status}</td>
              <td>{new Date(m.scheduledAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
