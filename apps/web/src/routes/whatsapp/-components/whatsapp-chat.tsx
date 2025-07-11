import { useAtom } from "jotai";
import { CornerDownLeft, Mic, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { TextPilot } from "@/components/sidebars/textpilot";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ExpandableChatHeader } from "@/components/ui/chat/expandable-chat";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { replyingToAtom } from "@/lib/atoms";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import type { SelectedChatType } from "../-hooks/use-whatsapp-messages";
import { WhatsappChatHeader } from "./whatsapp-chat-header";
import { WhatsappChatMessageBubble } from "./whatsapp-chat-message-bubble";
import { WhatsappReplyQuote } from "./whatsapp-reply-quote";

export function WhatsappChat({ chat }: { chat: SelectedChatType }) {
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useAtom(replyingToAtom);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(inputValue.trim() && chat.id)) return;

    if (replyingTo) {
      console.log("Replying to:", replyingTo);
    }

    console.log(`Sending to ${chat.id}: ${inputValue}`);
    const sentMessage = await orpc.whatsapp.sendMessage.call({
      to: chat.id,
      body: inputValue,
      quotedMessageId: replyingTo?.id._serialized,
    });

    console.log(sentMessage);

    setInputValue("");
    setReplyingTo(null);
  };

  return (
    <>
      <div className="flex h-svh w-full flex-col">
        <WhatsappChatHeader selectedChatId={chat.id} />

        <ResizablePanelGroup
          className="h-[calc(100dvh-69px)]"
          direction="horizontal"
        >
          <ResizablePanel className="flex h-[calc(100dvh-69px)] flex-col">
            <ScrollArea
              className={cn({
                "h-[calc(100dvh-69px-143px+8px)]": !replyingTo,
                "h-[calc(100dvh-69px-32px-147px-69px+32px)] ": replyingTo,
              })}
            >
              <ChatMessageList>
                {chat.messages.map((message, index) => {
                  const previousMessage = chat.messages[index - 1];
                  const nextMessage = chat.messages[index + 1];

                  const isFirstInGroup =
                    !previousMessage || previousMessage.from !== message.from;
                  const isLastInGroup =
                    !nextMessage || nextMessage.from !== message.from;

                  return (
                    <WhatsappChatMessageBubble
                      key={message.id._serialized}
                      message={message}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      onClick={() => {
                        if (replyingTo && replyingTo.id === message.id)
                          setReplyingTo(null);
                        else setReplyingTo(message);
                      }}
                      isGroup={chat.isGroup}
                    />
                  );
                })}
              </ChatMessageList>
            </ScrollArea>

            <div
              className={cn("flex w-full flex-col border-t px-4 pt-4 pb-4", {
                "h-[calc(69px+147px-73px-8px)]": !replyingTo,
                "h-[calc(69px+147px+32px-32px)] justify-between": replyingTo,
              })}
            >
              {replyingTo && (
                <WhatsappReplyQuote
                  message={replyingTo}
                  onClose={() => setReplyingTo(null)}
                />
              )}
              <form
                className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                onSubmit={handleSendMessage}
              >
                <ChatInput
                  className="min-h-12 resize-none rounded-lg border-0 bg-background p-3 shadow-none focus-visible:ring-0"
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  value={inputValue}
                />
                <div className="flex items-center p-3 pt-2">
                  {/* <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>

                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                  </Button> */}

                  <Button className="ml-auto gap-1.5" size="sm">
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={36}>
            <TextPilot />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
