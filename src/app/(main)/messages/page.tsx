
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { type Conversation, type Message as MessageType, type User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock data moved here since it's no longer in /lib/data.ts
const users: Omit<User, 'id'>[] = [
    { name: 'Alice', username: 'alice', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=alice', bio: 'Bio of Alice', posts: [], followers: 100, following: 50, saved: [], profileSetupComplete: true },
    { name: 'Bob', username: 'bob', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=bob', bio: 'Bio of Bob', posts: [], followers: 200, following: 75, saved: [], profileSetupComplete: true },
    { name: 'Charlie', username: 'charlie', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=charlie', bio: 'Bio of Charlie', posts: [], followers: 300, following: 100, saved: [], profileSetupComplete: true },
].map((u, i) => ({ ...u, id: `user${i + 1}` }));

const conversations: Conversation[] = [
    {
        id: 'convo1',
        participants: ['user1', 'user2'],
        messages: [
            { id: 'msg1', senderId: 'user1', text: 'Hey Bob!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { id: 'msg2', senderId: 'user2', text: 'Hey Alice! How are you?', createdAt: new Date(Date.now() - 1000 * 60 * 59) },
        ],
    },
    {
        id: 'convo2',
        participants: ['user1', 'user3'],
        messages: [
            { id: 'msg3', senderId: 'user3', text: 'Hi Alice, check out this cool post.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
            { id: 'msg4', senderId: 'user1', text: 'Wow, thanks Charlie!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23) },
        ],
    },
];


export default function MessagesPage() {
    const { user: currentUser } = useAuth();
    const isMobile = useIsMobile();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);
    const [messages, setMessages] = useState<MessageType[]>(selectedConversation?.messages || []);
    const [newMessage, setNewMessage] = useState("");

    if (!currentUser) return null;

    // We'll use the current user's ID for the demo. In a real app, this would be handled differently.
    const userConversations = conversations.filter(c => c.participants.includes('user1'));

    const handleSelectConversation = (convo: Conversation) => {
        setSelectedConversation(convo);
        setMessages(convo.messages);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() && currentUser) {
            const message: MessageType = {
                id: `m${Date.now()}`,
                senderId: 'user1', // Hardcode for demo
                text: newMessage,
                createdAt: new Date(),
            }
            setMessages([...messages, message]);
            setNewMessage("");
        }
    };
    
    const getOtherParticipant = (convo: Conversation) => {
        const otherId = convo.participants.find(p => p !== 'user1'); // Hardcode for demo
        return users.find(u => u.id === otherId);
    };

    if (isMobile) {
        return (
             <div className="h-full">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Messages</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[calc(100%-80px)]">
                    {userConversations.map(convo => {
                        const otherUser = getOtherParticipant(convo);
                        if (!otherUser) return null;
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        return (
                            <div key={convo.id} onClick={() => alert("Chat view not implemented for mobile demo.")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent">
                                <Avatar>
                                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{otherUser.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </ScrollArea>
             </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] border rounded-lg overflow-hidden m-4 bg-card">
            <aside className="w-1/3 border-r h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Messages</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                    {userConversations.map(convo => {
                        const otherUser = getOtherParticipant(convo);
                        if (!otherUser) return null;
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        return (
                            <div key={convo.id} onClick={() => handleSelectConversation(convo)}
                                className={cn("flex items-center gap-3 p-3 cursor-pointer hover:bg-accent",
                                    selectedConversation?.id === convo.id && "bg-accent"
                                )}>
                                <Avatar>
                                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{otherUser.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{lastMessage.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </ScrollArea>
            </aside>
            <main className="flex-1 flex flex-col h-full">
                {selectedConversation && getOtherParticipant(selectedConversation) ? (
                    <>
                        <CardHeader className="flex flex-row items-center gap-3 border-b">
                            <Avatar>
                                <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                                <AvatarFallback>{getOtherParticipant(selectedConversation)?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{getOtherParticipant(selectedConversation)?.name}</h3>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={cn("flex gap-2 items-end",
                                        msg.senderId === 'user1' ? "justify-end" : "justify-start"
                                    )}>
                                        <div className={cn("rounded-lg px-3 py-2 max-w-xs md:max-w-md",
                                            msg.senderId === 'user1' 
                                                ? "bg-primary text-primary-foreground" 
                                                : "bg-secondary"
                                        )}>
                                            <p>{msg.text}</p>
                                            <p className={cn("text-xs opacity-70 mt-1",
                                             msg.senderId === 'user1' ? "text-right" : "text-left")}>
                                                {format(msg.createdAt, "p")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <CardContent className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </CardContent>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <MessageSquare className="w-16 h-16"/>
                        <h2 className="text-xl font-bold">Your Messages</h2>
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
