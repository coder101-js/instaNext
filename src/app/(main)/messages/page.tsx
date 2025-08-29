
"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/auth-context";
import { type Conversation, type Message as MessageType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket-types";

export default function MessagesPage() {
    const { user: currentUser, token } = useAuth();
    const router = useRouter();
    const isMobile = useIsMobile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    // Effect to initialize and clean up socket connection
    useEffect(() => {
        if (!currentUser) return;
    
        // Connect to the socket server
        fetch('/api/socket'); // This initializes the socket server on the backend
    
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
            path: '/api/socket_io',
            addTrailingSlash: false
        });

        socketRef.current = socket;
    
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('joinRoom', currentUser.id);
        });
    
        socket.on('receiveMessage', (message: MessageType) => {
            if (selectedConversation && message.senderId !== currentUser.id) {
                setMessages(prev => [...prev, message]);
                
                // Update conversation list with new message
                setConversations(prevConvos => prevConvos.map(c => {
                    if (c.id === selectedConversation.id) {
                       const updatedMessages = [...(c.messages || []), message];
                       return {...c, messages: updatedMessages, updatedAt: new Date()};
                    }
                    return c;
                 }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );
            }
        });
    
        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    
        return () => {
            socket.disconnect();
        };
    }, [currentUser, selectedConversation]);


    useEffect(() => {
        const fetchConversations = async () => {
            if (!token) return;
            setIsLoading(true);
            try {
                const res = await fetch('/api/messages/conversations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                    if (data.length > 0 && !selectedConversation) {
                        handleSelectConversation(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, [token, selectedConversation]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
            });
        }
    }, [messages]);

    const handleSelectConversation = (convo: Conversation) => {
        setSelectedConversation(convo);
        setMessages(convo.messages || []);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !token || !selectedConversation || !socketRef.current) return;

        const otherParticipant = selectedConversation.participants.find(p => p.id !== currentUser.id);
        if (!otherParticipant) return;

        setIsSending(true);

        const optimisticMessage: MessageType = {
            id: `optimistic-${Date.now()}`,
            senderId: currentUser.id,
            text: newMessage,
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, optimisticMessage]);
        const messageToSend = newMessage;
        setNewMessage("");

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: otherParticipant.id,
                    text: messageToSend
                })
            });

            if (response.ok) {
                const { newMessage: savedMessage } = await response.json();
                socketRef.current.emit('sendMessage', savedMessage, otherParticipant.id);
                setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? savedMessage : m));
                 setConversations(prev => prev.map(c => {
                    if (c.id === selectedConversation.id) {
                       const updatedMessages = [...c.messages.filter(m => m.id !== optimisticMessage.id), savedMessage];
                       return {...c, messages: updatedMessages, updatedAt: new Date() };
                    }
                    return c;
                 }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );
            } else {
                 setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            }
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const otherParticipant = selectedConversation 
        ? selectedConversation.participants.find(p => p.id !== currentUser?.id) 
        : null;

    if (isLoading) {
        return <MessagesPageSkeleton />;
    }

    if (isMobile) {
        // Mobile view remains largely the same, maybe implement a chat detail view later
        return (
             <div className="h-full">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Messages</CardTitle>
                </CardHeader>
                 {conversations.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8">No conversations yet.</div>
                 ) : (
                    <ScrollArea className="h-[calc(100%-80px)]">
                        {conversations.map(convo => {
                            const otherUser = convo.participants.find(p => p.id !== currentUser?.id);
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
                                        <p className="text-sm text-muted-foreground truncate">{lastMessage?.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </ScrollArea>
                 )}
             </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] border rounded-lg overflow-hidden m-4 bg-card">
            <aside className="w-1/3 border-r h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Messages</CardTitle>
                </CardHeader>
                {conversations.length === 0 ? (
                     <div className="text-center text-muted-foreground p-8 flex-1">No conversations yet.</div>
                ) : (
                <ScrollArea className="flex-1">
                    {conversations.map(convo => {
                         const otherUser = convo.participants.find(p => p.id !== currentUser?.id);
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
                                    <p className="text-sm text-muted-foreground truncate">{lastMessage?.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </ScrollArea>
                )}
            </aside>
            <main className="flex-1 flex flex-col h-full">
                {selectedConversation && otherParticipant ? (
                    <>
                        <CardHeader className="flex flex-row items-center gap-3 border-b">
                            <Avatar>
                                <AvatarImage src={otherParticipant.avatar} />
                                <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{otherParticipant.name}</h3>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={cn("flex gap-2 items-end",
                                        msg.senderId === currentUser?.id ? "justify-end" : "justify-start"
                                    )}>
                                        <div className={cn("rounded-lg px-3 py-2 max-w-xs md:max-w-md",
                                            msg.senderId === currentUser?.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary"
                                        )}>
                                            <p>{msg.text}</p>
                                            <p className={cn("text-xs opacity-70 mt-1",
                                             msg.senderId === currentUser?.id ? "text-right" : "text-left")}>
                                                {format(new Date(msg.createdAt), "p")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <CardContent className="p-4 border-t bg-background">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1" />
                                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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

function MessagesPageSkeleton() {
    return (
        <div className="flex h-[calc(100vh-2rem)] border rounded-lg overflow-hidden m-4 bg-card">
            <aside className="w-1/3 border-r h-full flex flex-col">
                <CardHeader>
                    <Skeleton className="h-7 w-32" />
                </CardHeader>
                <div className="flex-1 p-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                         <div key={i} className="flex items-center gap-3 p-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
             <main className="flex-1 flex flex-col h-full">
                 <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <MessageSquare className="w-16 h-16"/>
                    <h2 className="text-xl font-bold">Your Messages</h2>
                    <p>Select a conversation to start chatting.</p>
                </div>
            </main>
        </div>
    )
}
