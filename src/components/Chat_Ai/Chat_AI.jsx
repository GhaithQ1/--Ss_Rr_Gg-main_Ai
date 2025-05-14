import { useEffect, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import './Chat_AI.css';
import './Attachments.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperPlane, faRobot, faUser, faSmile,
    faMicrophone, faEllipsisH, faPlus, faComment,
    faClock, faBars, faChevronRight, faTrash,
    faMicrophoneSlash, faFaceSmile, faArrowDown,
    faFile, faPaperclip, faImage, faDownload, faTimes,
    faRedo, faMagic, faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate } from "react-router-dom";
const Chat_AI = () => {
    const Navigate = useNavigate();
    const API = 'https://backendprojecr-production.up.railway.app/api/v2';
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    // حالة التحميل للمحادثات
    const [conversationLoading, setConversationLoading] = useState(false);
    const [userId, setUserId] = useState();
    const [cookies, setCookies] = useCookies(["token"]);
    const messagesEndRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    // لتخزين عناوين المحادثات وآخر رسائل
    const [conversationTitles, setConversationTitles] = useState({});
    // حالة لتتبع ما إذا كان منتقي الإيموجي مفتوحًا
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeConversation, setActiveConversation] = useState(null);
    // حالة لتتبع ما إذا كان الشريط الجانبي مفتوحًا أم لا
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [MyData, SetMyData] = useState({});
    // حالة لتتبع ما إذا كان التعرف على الكلام نشطًا
    const [isListening, setIsListening] = useState(false);
    // مرجع للتعرف على الكلام
    const recognitionRef = useRef(null);
    // حالة لتتبع ما إذا كان زر التمرير لأسفل مرئيًا
    const [showScrollButton, setShowScrollButton] = useState(false);
    // مرجع لحاوية الرسائل للتحقق من التمرير
    const messagesContainerRef = useRef(null);
    // حالة لتخزين الملفات المرفقة
    const [attachments, setAttachments] = useState([]);
    // مرجع لعنصر إدخال الملفات
    const fileInputRef = useRef(null);
    // حالة لتتبع ما إذا كان يتم إعادة توليد الرد
    const [regenerating, setRegenerating] = useState(false);
    // تخزين آخر رسالة من المستخدم لإعادة التوليد
    const [lastUserMessage, setLastUserMessage] = useState(null);
    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for deletion
    // State for animated placeholder
    const [placeholder, setPlaceholder] = useState("Ask me anything...");
    const [showCursor, setShowCursor] = useState(true); // State for blinking cursor
    // Reference for auto-resizing textarea
    const textareaRef = useRef(null);
    const placeholders = [
        "Ask me anything...",
        "How can I help you today?",
        "Ask about coding...",
        "Need information on any topic?",
        "Want to learn something new?",
        "Have a question?"
    ];

    // Effect for blinking cursor
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 1000); // Blink every 500ms

        return () => clearInterval(cursorInterval);
    }, []);

    // Effect for animated placeholder
    useEffect(() => {
        let currentIndex = 0;
        let currentPlaceholder = "";
        let isDeleting = false;
        let charIndex = 0;

        const animatePlaceholder = () => {
            const currentText = placeholders[currentIndex];

            if (isDeleting) {
                // Deleting characters
                currentPlaceholder = currentText.substring(0, charIndex);
                charIndex--;

                if (charIndex < 0) {
                    isDeleting = false;
                    currentIndex = (currentIndex + 1) % placeholders.length;
                    charIndex = 0;
                    // Virtually no pause before starting to type next placeholder
                    setTimeout(animatePlaceholder, 100);
                    return;
                }
            } else {
                // Adding characters
                currentPlaceholder = currentText.substring(0, charIndex);
                charIndex++;

                if (charIndex > currentText.length) {
                    // Minimal pause at the end of typing before deleting
                    isDeleting = true;
                    setTimeout(animatePlaceholder, 100);
                    return;
                }
            }

            // Add a blinking cursor at the end of the text
            setPlaceholder(currentPlaceholder + (showCursor ? "|" : ""));

            // Speed of typing/deleting - smooth and natural typing feel
            // Variable speed to make it feel more human-like
            const baseSpeed = isDeleting ? 60 : 60;
            const randomVariation = Math.floor(Math.random() * 20); // Add natural randomness
            const speed = baseSpeed - randomVariation; // Subtract to make it faster sometimes
            setTimeout(animatePlaceholder, speed);
        };

        // Start the animation
        const animationTimeout = setTimeout(animatePlaceholder, 100);

        return () => clearTimeout(animationTimeout);
    }, []);
    const [loadingTitles, setLoadingTitles] = useState(false);
    // Fetch user data and conversations on component mount
    useEffect(() => {
        axios.get(`${API}/auth/get_date_my`, {
            headers: {
                Authorization: `Bearer ${cookies.token}`,
            },
        })
            .then(async (res) => {
                SetMyData(res.data.data)
                setUserId(res.data.data._id);
                setConversations(res.data.data.thread_id);

                // التحقق مما إذا كانت هناك محادثة جديدة تم إنشاؤها قبل إعادة التحميل
                const lastCreatedChat = localStorage.getItem('lastCreatedChat');

                // إذا كان هناك محادثات
                if (res.data.data.thread_id.length > 0) {
                    if (lastCreatedChat) {
                        // البحث عن المحادثة الجديدة في قائمة المحادثات
                        const newChatExists = res.data.data.thread_id.some(conv => conv.id_thread === lastCreatedChat);

                        if (newChatExists) {
                            // تعيين المحادثة الجديدة كمحادثة نشطة
                            setActiveConversation(lastCreatedChat);
                            // مسح المعرف من التخزين المحلي بعد استخدامه
                            localStorage.removeItem('lastCreatedChat');
                        } else {
                            // إذا لم يتم العثور على المحادثة الجديدة، اختر أحدث محادثة
                            const mostRecentConversation = res.data.data.thread_id[res.data.data.thread_id.length - 1];
                            setActiveConversation(mostRecentConversation.id_thread);
                            localStorage.removeItem('lastCreatedChat');
                        }
                    } else if (!activeConversation) {
                        // إذا لم تكن هناك محادثة جديدة ولم يتم تحديد محادثة نشطة، اختر أحدث محادثة
                        const mostRecentConversation = res.data.data.thread_id[res.data.data.thread_id.length - 1];
                        setActiveConversation(mostRecentConversation.id_thread);
                    }

                    // جلب عناوين المحادثات لكل المحادثات الموجودة
                    const fetchAllConversationTitles = async () => {
                        // تفعيل حالة تحميل العناوين
                        // setLoadingTitles(true);
                        console.log('Started loading conversation titles');

                        const titles = {};

                        // تعيين عناوين افتراضية لجميع المحادثات
                        for (const conv of res.data.data.thread_id) {
                            titles[conv.id_thread] = 'محادثة جديدة'; // عنوان افتراضي

                            // جلب رسائل المحادثة للحصول على العنوان
                            try {
                                const response = await axios.get(`${API}/chat_AI/${conv.id_thread}`, {
                                    headers: {
                                        Authorization: `Bearer ${cookies.token}`,
                                    },
                                });

                                if (response.data.messages && response.data.messages.length > 0) {
                                    const userMessages = response.data.messages.filter(msg => msg.role === 'user');
                                    if (userMessages.length > 0) {
                                        const firstUserMessage = userMessages[0].content;
                                        titles[conv.id_thread] = firstUserMessage.length > 25
                                            ? firstUserMessage.substring(0, 25) + '...'
                                            : firstUserMessage;
                                    }
                                }
                            } catch (error) {
                                console.error(`Error fetching messages for thread ${conv.id_thread}:`, error);
                            }
                        }

                        setConversationTitles(titles);
                        // إيقاف حالة تحميل العناوين
                        setLoadingTitles(false);
                    };

                    fetchAllConversationTitles();
                }
                // إذا لم يكن لدى المستخدم أي محادثات، قم بإنشاء محادثة جديدة تلقائياً
                else if (res.data.data.thread_id.length === 0) {
                    console.log('No threads found, creating a new one automatically');
                    try {
                        // تفعيل علامة إنشاء محادثة جديدة لمنع الإنشاء المزدوج
                        setCreatingNewChat(true);
                        // إيقاف حالة تحميل العناوين قبل إنشاء محادثة جديدة
                        setLoadingTitles(false);

                        // إنشاء محادثة جديدة تلقائياً
                        const response = await axios.post(`${API}/chat_AI/craete`,
                            { message: 'Start new chat' },
                            {
                                headers: {
                                    Authorization: `Bearer ${cookies.token}`,
                                },
                            }
                        );

                        const newThreadId = response.data.thread_id;
                        console.log('Auto-created new thread:', newThreadId);

                        if (newThreadId) {
                            // حفظ معرف المحادثة في التخزين المحلي للتعامل مع إعادة تحميل الصفحة
                            localStorage.setItem('lastCreatedChat', newThreadId);

                            const newConversation = { _id: newThreadId, id_thread: newThreadId };
                            setConversations([newConversation]);
                            setActiveConversation(newThreadId);

                            // تعيين عنوان افتراضي للمحادثة الجديدة
                            setConversationTitles(prev => ({
                                ...prev,
                                [newThreadId]: 'محادثة جديدة'
                            }));

                            // إيقاف حالة تحميل العناوين بعد إنشاء المحادثة بنجاح
                            setLoadingTitles(false);
                        }
                    } catch (error) {
                        console.error('Error auto-creating thread:', error);
                        // إيقاف حالة تحميل العناوين في حالة الخطأ
                        setLoadingTitles(false);
                    } finally {
                        // إيقاف علامة إنشاء محادثة جديدة
                        setCreatingNewChat(false);
                    }
                } else {
                    // إيقاف حالة تحميل العناوين إذا لم يكن هناك محادثات ولم يتم إنشاء محادثة جديدة
                    setLoadingTitles(false);
                }


            })
            .catch(error => {
                console.error('Error fetching data', error);
            });
    }, [cookies.token]);  // فقط إعادة التنفيذ عند تغيير التوكن

    // Fetch messages when a user selects a conversation
    useEffect(() => {
        if (!activeConversation) return;

        // تعيين حالة التحميل إلى true عند بدء تحميل المحادثة
        setConversationLoading(true);
        setMessages([]); // مسح الرسائل السابقة أثناء التحميل

        axios.get(`${API}/chat_AI/${activeConversation}`, {
            headers: {
                Authorization: `Bearer ${cookies.token}`,
            },
        })
            .then(res => {
                setMessages(res.data.messages);

                // تحديث عنوان المحادثة بناءً على الرسائل
                if (res.data.messages && res.data.messages.length > 0) {
                    // استخدم أول رسالة من المستخدم كعنوان للمحادثة
                    const userMessages = res.data.messages.filter(msg => msg.role === 'user');
                    if (userMessages.length > 0) {
                        const firstUserMessage = userMessages[0].content;
                        // اقتطاع الرسالة إذا كانت طويلة
                        const title = firstUserMessage.length > 25
                            ? firstUserMessage.substring(0, 25) + '...'
                            : firstUserMessage;

                        setConversationTitles(prev => ({
                            ...prev,
                            [activeConversation]: title
                        }));
                    }
                }

                // إيقاف حالة التحميل بعد الانتهاء
                setConversationLoading(false);
            })
            .catch(err => {
                console.error(err);
                // إيقاف حالة التحميل حتى في حالة الخطأ
                setConversationLoading(false);
            });

    }, [activeConversation]);

    // Function to scroll to the bottom of the chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea based on content
    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        }
    };


    // Resize textarea when input changes
    useLayoutEffect(() => {
        autoResizeTextarea();
    }, [input]);

    // Handle scroll events to show/hide the scroll button
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Show button if scrolled up more than 100px from bottom
            const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
            const isScrolledUp = scrollBottom > 100;
            setShowScrollButton(isScrolledUp);
        };

        // Initial check
        handleScroll();

        // Add event listener
        container.addEventListener('scroll', handleScroll);

        // Also check when window is resized
        window.addEventListener('resize', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [messages]); // Re-run when messages change

    // Handle emoji selection
    const handleEmojiClick = (emojiData) => {
        setInput(prev => prev + emojiData.emoji);
        // Keep emoji picker open after selection
        // setShowEmojiPicker(false); - removed to keep picker open
    };

    // Reference for the emoji picker container
    const emojiPickerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is on the emoji toggle button
            const isEmojiToggleButton = event.target.closest('.emoji-toggle-button');

            // Only close if click is outside picker AND not on the toggle button
            if (showEmojiPicker && emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                !isEmojiToggleButton) {
                setShowEmojiPicker(false);
            }
        };

        // Add event listener with a small delay to avoid immediate triggering
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        // Clean up the event listener and timeout
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Initialize speech recognition
    useEffect(() => {
        // Check if browser supports SpeechRecognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return;
        }

        // Create SpeechRecognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        // Configure speech recognition
        recognitionRef.current.continuous = true; // Set to continuous
        recognitionRef.current.interimResults = true; // Get interim results
        recognitionRef.current.lang = 'ar-SA'; // Set to Arabic

        // Handle results
        recognitionRef.current.onresult = (event) => {
            let finalTranscript = '';

            // Get all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                }
            }

            // Only update input if we have final transcript
            if (finalTranscript) {
                setInput(prevInput => prevInput + ' ' + finalTranscript);
            }
        };

        // Handle end of speech - don't automatically stop listening
        recognitionRef.current.onend = () => {
            // If still in listening state, restart recognition
            if (isListening) {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error('Error restarting speech recognition:', error);
                    setIsListening(false);
                }
            }
        };

        // Handle errors
        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        // Clean up on component unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Toggle speech recognition
    const toggleSpeechRecognition = () => {
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Create preview for each file
        const newAttachments = files.map(file => ({
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            name: file.name,
            size: file.size
        }));

        setAttachments(prev => [...prev, ...newAttachments]);
    };

    //Remove an attachment
    const removeAttachment = (index) => {
        setAttachments(prev => {
            const newAttachments = [...prev];
            // Revoke object URL to avoid memory leaks
            if (newAttachments[index].preview) {
                URL.revokeObjectURL(newAttachments[index].preview);
            }
            newAttachments.splice(index, 1);
            return newAttachments;
        });
    };

    // Send a new message
    const sendMessage = async () => {
        if (!input.trim() && attachments.length === 0) return;

        // Check if there's an active conversation, if not create one first
        let currentThreadId = activeConversation;

        // Only create a new thread if there's no active conversation and we're not already creating one
        if (!currentThreadId && !creatingNewChat) {
            try {
                // تفعيل علامة إنشاء محادثة جديدة لمنع الإنشاء المزدوج
                setCreatingNewChat(true);
                console.log('No active thread, creating a new one before sending message');

                // Create a new thread first
                const threadResponse = await axios.post(`${API}/chat_AI/craete`,
                    { message: 'Start new chat' },
                    {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`,
                        },
                    }
                );

                const newThreadId = threadResponse.data.thread_id;
                console.log('Created new thread before sending message:', newThreadId);

                if (newThreadId) {
                    // Save the thread ID to localStorage to handle page reloads
                    localStorage.setItem('lastCreatedChat', newThreadId);

                    // Update state with the new conversation
                    const newConversation = { _id: newThreadId, id_thread: newThreadId };
                    setConversations(prevConversations => {
                        // Check if thread already exists to prevent duplicates
                        const exists = prevConversations.some(conv => conv.id_thread === newThreadId);
                        if (exists) return prevConversations;
                        return [newConversation, ...prevConversations];
                    });

                    // Set as active conversation
                    setActiveConversation(newThreadId);
                    currentThreadId = newThreadId;

                    // Set default title
                    setConversationTitles(prev => ({
                        ...prev,
                        [newThreadId]: 'محادثة جديدة'
                    }));
                } else {
                    throw new Error('Failed to create new thread');
                }
            } catch (error) {
                console.error('Error creating new thread:', error);
                alert('حدث خطأ أثناء إنشاء محادثة جديدة');
                setLoading(false);
                setCreatingNewChat(false);
                return;
            } finally {
                // إيقاف علامة إنشاء محادثة جديدة
                setCreatingNewChat(false);
            }
        }

        // Create form data for file uploads
        const formData = new FormData();
        formData.append('message', input);
        formData.append('threadId', currentThreadId);

        // Add attachments to form data
        attachments.forEach((attachment) => {
            formData.append('files', attachment.file);
        });

        // Create message object with attachments info
        const userMessage = {
            role: "user",
            content: input,
            attachments: attachments.map(att => ({
                type: att.type,
                preview: att.preview,
                name: att.name,
                size: att.size
            }))
        };

        // Store the last user message for regeneration
        setLastUserMessage({
            content: input,
            attachments: attachments.map(att => ({
                file: att.file,
                type: att.type,
                preview: att.preview,
                name: att.name,
                size: att.size
            }))
        });

        // Add user message to the UI immediately
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setAttachments([]);
        setLoading(true);

        try {
            // Send message to the API
            const res = await axios.post(`${API}/chat_AI`, formData, {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            // Add AI response to the UI
            const aiMessage = { role: "assistant", content: res.data.reply };
            setMessages(prev => [...prev, aiMessage]);

            // If this is the first message in the conversation, update the title
            if (messages.length === 0) {
                setConversationTitles(prev => ({
                    ...prev,
                    [currentThreadId]: input.length > 25 ? input.substring(0, 25) + '...' : input
                }));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("حدث خطأ أثناء إرسال الرسالة");
        } finally {
            setLoading(false);
        }
    };

    // State to track if a new chat is being created
    const [creatingNewChat, setCreatingNewChat] = useState(false);
    // State to track if page is reloading
    const [isReloading, setIsReloading] = useState(false);
    // State to track if conversation titles are loading

    // وظيفة إعادة تحميل الصفحة
    const handleReload = () => {
        setIsReloading(true);
        // Reset loading states before reloading
        setLoadingTitles(false);
        window.location.reload();
    };

    // Handle creating a new chat
    const handleNewChat = async () => {
        try {
            // إظهار مؤشر التحميل في واجهة المستخدم
            setCreatingNewChat(true);

            // إرسال طلب لإنشاء محادثة جديدة
            const response = await axios.post(`${API}/chat_AI/craete`, { message: 'Start new chat' }, {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
            });

            // الحصول على thread_id الجديد من الاستجابة
            const newThreadId = response.data.thread_id;
            console.log('New thread created:', newThreadId);

            if (!newThreadId) {
                console.error('No thread_id returned from API');
                setCreatingNewChat(false);
                return;
            }

            // إنشاء كائن المحادثة الجديدة بنفس الهيكل المستخدم في المحادثات الأخرى
            const newConversation = { _id: newThreadId, id_thread: newThreadId };

            // تحديث قائمة المحادثات بشكل فوري
            setConversations(prevConversations => {
                // التحقق من أن المحادثة ليست موجودة بالفعل
                const exists = prevConversations.some(conv => conv.id_thread === newThreadId);
                if (exists) {
                    return prevConversations;
                }
                // إضافة المحادثة الجديدة في بداية القائمة
                return [newConversation, ...prevConversations];
            });

            // تعيين المحادثة الجديدة كمحادثة نشطة فوراً
            setActiveConversation(newThreadId);

            // مسح الرسائل السابقة
            setMessages([]);

            // تعيين عنوان افتراضي للمحادثة الجديدة
            setConversationTitles(prev => ({
                ...prev,
                [newThreadId]: 'محادثة جديدة' // "محادثة جديدة" بالعربية
            }));

            // إخفاء مؤشر التحميل
            setCreatingNewChat(false);

        } catch (error) {
            console.error('Error starting new chat:', error);
            // إخفاء مؤشر التحميل في حالة الخطأ
            setCreatingNewChat(false);
            // إظهار رسالة خطأ
            alert('حدث خطأ أثناء إنشاء محادثة جديدة');
        }
    };





    // Handle selecting an existing conversation
    const handleConversationSelect = (conversationId) => {
        if (conversationId === activeConversation) return; // تجنب إعادة تحميل نفس المحادثة
        setActiveConversation(conversationId);
        console.log('Selected conversation:', conversationId);
    };

    // Show delete confirmation modal
    const handleDeleteConversation = (event, conversationId) => {
        // منع انتشار الحدث لتجنب تحديد المحادثة
        event.stopPropagation();

        // Set the conversation to delete and show the modal
        setConversationToDelete(conversationId);
        setShowDeleteModal(true);
    };

    // Confirm delete conversation
    const confirmDeleteConversation = async () => {
        const conversationId = conversationToDelete;

        // Show loading indicator
        setIsDeleting(true);

        try {
            const response = await axios.delete(`${API}/chat_AI/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                },
            });

            // حذف المحادثة من قائمة المحادثات
            setConversations(prevConversations =>
                prevConversations.filter(conv => conv.id_thread !== conversationId)
            );

            // حذف عنوان المحادثة
            setConversationTitles(prev => {
                const newTitles = { ...prev };
                delete newTitles[conversationId];
                return newTitles;
            });

            // إذا كانت المحادثة المحذوفة هي النشطة حاليًا
            if (activeConversation === conversationId) {
                // تحديد محادثة أخرى كنشطة إذا كانت موجودة
                const remainingConversations = conversations.filter(conv => conv.id_thread !== conversationId);
                if (remainingConversations.length > 0) {
                    setActiveConversation(remainingConversations[0].id_thread);
                } else {
                    setActiveConversation(null);
                    setMessages([]);
                    window.location.reload();
                }
            }
            

        } catch (error) {
            console.error('Error deleting conversation:', error);
        } finally {
            // Reset loading state
            setIsDeleting(false);
            // Close the modal
            setShowDeleteModal(false);
            setConversationToDelete(null);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setConversationToDelete(null);
    };

    // تبديل حالة الشريط الجانبي
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // // Regenerate or improve the AI response
    const regenerateResponse = async (type) => {
        console.log("1")
        if (!lastUserMessage || regenerating) return;

        if (!lastUserMessage.content || lastUserMessage.content.trim() === '') {
            alert('لا يمكن إعادة توليد رد لرسالة فارغة');
            return;
        }

        setRegenerating(true);

        try {
            const formData = new FormData();
            formData.append('threadId', activeConversation);

            const messageContent = lastUserMessage.content || 'رسالة المستخدم';
            if (type === 'regenerate') {
                formData.append('message', `Re-answer to: ${messageContent}`);
            } else if (type === 'improve') {
                formData.append('message', `Improve the previous answer: ${messageContent}`);
            } else {
                formData.append('message', messageContent);
            }

            // الملفات
            if (lastUserMessage.attachments?.length) {
                lastUserMessage.attachments.forEach(attachment => {
                    if (attachment?.file) {
                        formData.append('files', attachment.file);
                    }
                });
            }

            // إزالة الرسالة الأخيرة من المساعد
            setMessages(prev => prev.slice(0, -1));

            // إضافة رسالة التحميل
            const loadingMessage = { role: "assistant", content: "Loading..." };
            setMessages(prev => [...prev, loadingMessage]);
            // لا نقوم بتفعيل حالة التحميل لتجنب ظهور المؤشر في الأسفل

            const res = await axios.post(`${API}/chat_AI`, formData, {
                headers: {
                    Authorization: `Bearer ${cookies.token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            // إزالة رسالة التحميل
            setMessages(prev => prev.filter(msg => !(msg.role === "assistant" && msg.content === "Loading...")));
            // لم نقم بتفعيل حالة التحميل لذلك لا حاجة لإيقافها

            const aiMessage = { role: "assistant", content: res.data.reply };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error regenerating response:", error);
            alert("حدث خطأ أثناء إعادة توليد الرد");

            const lastMessages = messages.slice(-2);
            if (!(lastMessages.length === 2 && lastMessages[1].role === 'assistant')) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "عذراً، حدث خطأ أثناء محاولة إعادة توليد الرد."
                }]);
            }
        } finally {
            setRegenerating(false);
        }
    };


    return (
        <div className="chat-app-container">
            <div className={`chat-sidebar ${sidebarOpen ? 'closed' : 'open'}`}>
                <div className="sidebar-header">

                    <h2>Chats</h2>
                    <button className="toggle-sidebar-button" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
                <button className="new-chat-button" onClick={handleNewChat} disabled={creatingNewChat}>
                    {creatingNewChat ? (
                        <>
                            <div className="button-spinner"></div>
                            <span>Creating...</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faPlus} />
                            <span>New Chat</span>
                        </>
                    )}
                </button>
                <div className="conversations-list">
                    {loadingTitles ? (
                        <div className="loading-conversations">
                            <div className="sidebar-spinner"></div>
                            <p>Loading chats...</p>
                        </div>
                    ) : (
                        /* ترتيب المحادثات بحيث تكون المحادثات الأحدث في الأعلى */
                        [...conversations].reverse().map(conv => (
                            <div
                                key={conv._id}
                                className={`conversation-item ${activeConversation === conv.id_thread ? 'active' : ''}`}
                                onClick={() => handleConversationSelect(conv.id_thread)} // عند النقر على المحادثة يتم تحديدها
                            >
                                <div className="conversation-icon">
                                    <FontAwesomeIcon icon={faComment} />
                                </div>
                                <div className="conversation-title">
                                    {conversationTitles[conv.id_thread] || 'محادثة جديدة'}
                                </div>
                                <div className="conversation-actions">
                                    <button
                                        className="delete-conversation-btn"
                                        onClick={(e) => handleDeleteConversation(e, conv.id_thread)}
                                        title="حذف المحادثة"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                                <div className="conversation-time">
                                    <FontAwesomeIcon icon={faClock} className="time-icon" />
                                    {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="chat-container-ai">
                <header className="chat-title-ai">
                    <div className="logo-container">
                        <button className="toggle-sidebar-button" onClick={toggleSidebar}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>

                        <FontAwesomeIcon icon={faRobot} className="robot-icon" />
                        <h1>Sense AI</h1>
                    </div>
                    <div className="header-buttons">
                        <button className="reload-button" onClick={handleReload} disabled={isReloading}>
                            {isReloading ? (
                                <div className="button-spinner"></div>
                            ) : (
                                <FontAwesomeIcon icon={faSyncAlt} />
                            )}
                        </button>
                        <button className="settings-button">
                            <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                    </div>
                </header>

                <div className="chat-box-ai">
                    {conversationLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p className="loading-text">Loading conversation...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-chat">
                            <div className="logo-circle">
                                <div className="inner-shape"></div>
                            </div>
                            <h2>Hi, {MyData.name}</h2>
                            <div className="main-prompt">Can I help you with anything?</div>
                            <p className="subtitle">Ready to assist you with anything you need?</p>
                        </div>
                    ) : (
                        <div className="messages-container" ref={messagesContainerRef}>
                            {messages?.map((msg, i) => (
                                <div key={i} className={`message-ai ${msg.role === 'user' ? 'user-ai' : 'assistant-ai'}`}>
                                    {msg.role === 'user' ? (
                                        <>
                                            <div className="message-content">
                                                <div className="message-header">
                                                    <div className="message-avatar">
                                                        <img
                                                            src={
                                                                MyData.profilImage
                                                                    ? MyData.profilImage.startsWith("http")
                                                                        ? MyData.profilImage
                                                                        : `https://backendprojecr-production.up.railway.app/user/${MyData.profilImage}`
                                                                    : "/image/pngegg.png"
                                                            }
                                                            alt={`Image of ${MyData.name}`}
                                                        />
                                                    </div>
                                                    <div className="message-sender">{MyData.name}</div>
                                                </div>
                                                <div className="message-text">{msg.content}</div>
                                                <div className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>


                                                {/* Display attachments if any */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="message-attachments">
                                                        {msg.attachments.map((attachment, index) => (
                                                            <div key={index} className="attachment-item">
                                                                {attachment.type === 'image' ? (
                                                                    <div className="image-attachment">
                                                                        <img src={attachment.preview} alt={attachment.name} />
                                                                        <div className="attachment-info">
                                                                            <span>{attachment.name}</span>
                                                                            <a href={attachment.preview} download={attachment.name} className="download-button">
                                                                                <FontAwesomeIcon icon={faDownload} />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="file-attachment">
                                                                        <FontAwesomeIcon icon={faFile} className="file-icon" />
                                                                        <div className="attachment-info">
                                                                            <span>{attachment.name}</span>
                                                                            <span className="file-size">{Math.round(attachment.size / 1024)} KB</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="message-content">
                                                <div className="message-header">
                                                    <div className="message-avatar">
                                                        <FontAwesomeIcon icon={faRobot} />
                                                    </div>
                                                    <div className="message-sender">Sense AI</div>
                                                </div>
                                                <div>{msg.content}</div>
                                                <div className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                                                {/* Regenerate buttons - only show for the last AI message and when there's a valid lastUserMessage */}
                                                {i === messages.length - 1 && msg.role === 'assistant' && lastUserMessage && lastUserMessage.content && (
                                                    <div className="regenerate-buttons">
                                                        <button
                                                            className="regenerate-button"
                                                            onClick={() => regenerateResponse('regenerate')}
                                                            disabled={regenerating}
                                                        >
                                                            <FontAwesomeIcon icon={faRedo} />
                                                            <span> Reply back</span>
                                                        </button>
                                                        <button
                                                            className="regenerate-button improve"
                                                            onClick={() => regenerateResponse('improve')}
                                                            disabled={regenerating}
                                                        >
                                                            <FontAwesomeIcon icon={faMagic} />
                                                            <span> Improve</span>
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Show loading indicator when regenerating */}
                                                {regenerating && i === messages.length - 1 && msg.role === 'assistant' && (
                                                    <div className="regenerating-indicator">
                                                        <div className="thinking-indicator">
                                                            <span className="thinking-dot"></span>
                                                            <span className="thinking-dot"></span>
                                                            <span className="thinking-dot"></span>
                                                        </div>
                                                        <span>Regenerating</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="message-ai assistant-ai loading-message">
                                    <div className="message-content">
                                        <div className="message-header">
                                            <div className="message-avatar">
                                                <FontAwesomeIcon icon={faRobot} />
                                            </div>
                                            <div className="message-sender">Sense AI</div>
                                            <div className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div className="thinking-indicator">
                                            <span className="thinking-dot"></span>
                                            <span className="thinking-dot"></span>
                                            <span className="thinking-dot"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />

                            {/* Scroll to bottom button */}
                            {showScrollButton && (
                                <button
                                    className="scroll-bottom-button"
                                    onClick={scrollToBottom}
                                    title="Scroll to latest message"
                                >
                                    <FontAwesomeIcon icon={faArrowDown} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Attachments preview */}
                {attachments.length > 0 && (
                    <div className="attachments-preview">
                        {attachments.map((attachment, index) => (
                            <div key={index} className="attachment-preview-item">
                                {attachment.type === 'image' ? (
                                    <div className="image-preview">
                                        <img src={attachment.preview} alt={attachment.name} />
                                        <button
                                            className="remove-attachment"
                                            onClick={() => removeAttachment(index)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="file-preview">
                                        <FontAwesomeIcon icon={faFile} className="file-icon" />
                                        <span className="file-name">{attachment.name}</span>
                                        <button
                                            className="remove-attachment"
                                            onClick={() => removeAttachment(index)}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="input-container">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="emoji-picker-container" ref={emojiPickerRef}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} width={400} height={400} theme="dark" emojiStyle="apple" searchDisabled previewConfig={{ showPreview: false }} />
                        </div>
                    )}

                    <div className="input-section-ai">
                        {/* Textarea at the top */}
                        <textarea
                            ref={textareaRef}
                            className="chat-input-ai"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault(); // Prevent default to avoid newline
                                    sendMessage();
                                }
                            }}
                            placeholder={placeholder}
                            rows="1"
                        />

                        {/* Icons below the textarea */}
                        <div className="input-controls">
                            <button
                                className="tool-button emoji-toggle-button"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling
                                    setShowEmojiPicker(!showEmojiPicker);
                                }}
                            >
                                <FontAwesomeIcon icon={faFaceSmile} />
                            </button>

                            {/* File input (hidden) */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                multiple
                            />

                            {/* File attachment button */}
                            {/* <button 
                                className="tool-button"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FontAwesomeIcon icon={faPaperclip} />
                            </button> */}
                            <div className="icon-container">
                                <button
                                    className={`tool-button speech-button ${isListening ? 'listening' : ''}`}
                                    onClick={toggleSpeechRecognition}
                                >
                                    <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} />
                                </button>
                                <button
                                    onClick={sendMessage}
                                    className="send-button-ai"
                                    disabled={loading || (!input.trim() && attachments.length === 0)}
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="disclaimer">Since AI may contain errors, we recommend checking important information.</div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={cancelDelete}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete Conversation</h3>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this conversation? This action cannot be undone.
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn modal-btn-cancel"
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={`modal-btn modal-btn-delete ${isDeleting ? 'loading' : ''}`}
                                onClick={confirmDeleteConversation}
                                disabled={isDeleting}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Chat_AI;
