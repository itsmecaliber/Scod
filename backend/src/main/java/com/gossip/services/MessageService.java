package com.gossip.services;

import com.gossip.dto.ChatMessage;
import com.gossip.dto.ChatPartnerDTO;
import com.gossip.entity.Message;
import com.gossip.entity.User;
import com.gossip.repository.MessageRepository;
import com.gossip.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message saveMessage(ChatMessage chatMessage) {
        User sender = userRepository.findById(chatMessage.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(chatMessage.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(chatMessage.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setSeen(false);

        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        return messageRepository.findConversationBetweenUsers(userId1, userId2);
    }

    public List<Message> getUnseenMessages(Long receiverId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        return messageRepository.findByReceiverAndSeenIsFalse(receiver);
    }

    @Transactional
    public void markMessagesAsSeen(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        List<Message> unseen = messageRepository.findBySenderAndReceiverAndSeenFalse(sender, receiver);
        for (Message message : unseen) {
            message.setSeen(true);
        }
        messageRepository.saveAll(unseen);
    }

    public List<ChatPartnerDTO> getChatPartners(Long userId) {
        return messageRepository.findChatPartnersWithLatestMessage(userId);
    }
}
