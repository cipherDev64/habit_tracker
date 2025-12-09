"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X, Loader2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

declare global {
    interface Window {
        puter: {
            ai: {
                chat: (prompt: string, options?: { model?: string }) => Promise<{ message: { content: string } }>;
            };
            print: (msg: any) => void;
        };
    }
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Using Puter.js for chat
            // Note: The puter.ai.chat response structure might need adjustment based on exact library version, 
            // but effectively it returns a promise usually resolving to the output or an object with text.
            // Based on user snippet: puter.print(response) implies response is the text or an object.
            // But usually LLM wrappers return an object. 
            // Only way to know for sure is to try or assume standard. 
            // Let's assume response is text or we check.
            // Actually, typical puter.ai.chat returns specific structure but user snippet seemed simple.
            // Let's use 'any' safely or check implementation.

            // Re-reading user snippet:
            // .then(response => { puter.print(response); });
            // This suggests response itself is printable.

            // However, for Chat interface we need the text.
            // Let's assume response (if string) or response.message.content (if OpenAI-like).
            // Let's try to handle it robustly.

            const response = await window.puter.ai.chat(input, {
                model: 'gemini-1.5-flash'
            });

            // Puter.js chat usually returns an object like { message: { role: 'assistant', content: '...' } } 
            // OR just the string content depending on the wrapper level.
            // Documentation for puter.js v2 says puter.ai.chat(prompt) returns a ChatCompletion object or string?
            // User snippet `puter.print(response)` is vague (print handles objects too).

            // Let's assume it returns a standard object similar to OpenAI or just text.
            // We will inspect it. For typing I'll use `any` cast to be safe for now, 
            // or better, handle the object structure if it matches common patterns.

            let content = "";
            if (typeof response === "string") {
                content = response;
            } else if (typeof response === "object" && response?.message?.content) {
                content = response.message.content;
            } else {
                content = JSON.stringify(response);
            }

            const assistantMessage: Message = { role: "assistant", content: content };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] sm:w-[400px] shadow-xl"
                    >
                        <Card className="border-primary/20 shadow-2xl overflow-hidden backdrop-blur-sm bg-background/95">
                            <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <MessageSquare className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-medium">Habit Assistant</CardTitle>
                                        <p className="text-xs text-muted-foreground">Ask for diet & health tips</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                    <Minimize2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                                    <div className="flex flex-col gap-4">
                                        {messages.length === 0 && (
                                            <div className="text-center text-muted-foreground py-8 px-4">
                                                <p className="text-sm">Hi! I'm your personal health assistant.</p>
                                                <p className="text-xs mt-2">Ask me about diet, exercise, or building better habits!</p>
                                            </div>
                                        )}
                                        {messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                                    msg.role === "user"
                                                        ? "ml-auto bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    <span>Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="p-3 border-t bg-muted/10">
                                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                                    <Input
                                        ref={inputRef}
                                        placeholder="Type your message..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                        <Send className="h-4 w-4" />
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                </Button>
            </motion.div>
        </div>
    );
}
