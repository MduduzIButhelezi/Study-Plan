import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Calendar, Tag, Pin, Image as ImageIcon, Mic, Share2, MoreVertical, FileText, X, Play, StopCircle, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  pinned: boolean;
  tags: string[];
  attachments: {
    type: 'image' | 'audio';
    url: string;
    name: string;
  }[];
  user_id?: string;
  timestamp?: any;
}

export default function Notes() {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    subject: 'General',
    content: '',
    tags: [],
    attachments: []
  });

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<string[]>(['All']);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'color', 'background'
  ];

  // Fetch Subjects from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'subjects'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSubjects = snapshot.docs.map(doc => doc.data().name);
      setSubjects(['All', ...fetchedSubjects]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subjects');
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Notes from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notes'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(fetchedNotes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'subjects'), {
        name: newSubjectName.trim(),
        user_id: user.uid,
        timestamp: serverTimestamp()
      });
      setNewSubjectName('');
      setIsAddingSubject(false);
      sendNotification('Subject Added', `Folder "${newSubjectName}" created.`, 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subjects');
    }
  };

  const deleteSubject = async (name: string) => {
    if (name === 'All') return;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'subjects'),
        where('user_id', '==', user.uid),
        where('name', '==', name)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'subjects', d.id)));
      await Promise.all(deletePromises);
      
      if (selectedSubject === name) setSelectedSubject('All');
      sendNotification('Subject Deleted', `Folder "${name}" removed.`, 'info');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'subjects');
    }
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        sendNotification('Recording Error', 'Microphone access is not supported in this browser.', 'error');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        sendNotification('Microphone Not Found', 'Please connect a microphone and try again.', 'error');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        sendNotification('Permission Denied', 'Please allow microphone access in your browser settings.', 'error');
      } else {
        sendNotification('Recording Error', 'Could not access microphone. Please check permissions.', 'error');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const addAudioAttachment = () => {
    if (audioUrl) {
      setNewNote(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), { type: 'audio', url: audioUrl, name: `Voice Recording ${new Date().toLocaleTimeString()}` }]
      }));
      setAudioUrl(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), { 
            type: 'image', 
            url: reader.result as string, 
            name: file.name 
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveNote = async () => {
    if (!newNote.title || !newNote.content || !user) return;
    
    try {
      const noteData = {
        title: newNote.title,
        subject: newNote.subject,
        content: newNote.content,
        timestamp: serverTimestamp(),
        pinned: false,
        tags: newNote.tags || [],
        attachments: newNote.attachments || [],
        user_id: user.uid
      };

      await addDoc(collection(db, 'notes'), noteData);
      sendNotification('Note Saved', `"${newNote.title}" has been saved successfully.`, 'success');
      setIsAddingNote(false);
      setNewNote({ title: '', subject: 'General', content: '', tags: [], attachments: [] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notes');
    }
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    try {
      await updateDoc(doc(db, 'notes', id), { pinned: !currentPinned });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notes');
    }
  };

  const removeAttachment = (index: number) => {
    setNewNote(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex h-full gap-8 overflow-hidden relative">
      <div className="hidden md:flex flex-col w-56 shrink-0">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Subject Folders</h3>
        <ul className="space-y-1">
          {subjects.map(subject => (
            <li 
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`p-2 rounded-xl text-sm font-medium cursor-pointer transition-all flex justify-between items-center group/item ${
                selectedSubject === subject ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span>{subject}</span>
              {subject !== 'All' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSubject(subject); }}
                  className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
            </li>
          ))}
        </ul>
        
        {isAddingSubject ? (
          <div className="mt-4 flex flex-col gap-2">
            <input 
              autoFocus
              type="text" 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Folder name..."
              className="bg-[#252528] border border-white/10 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:border-[#6750A4]"
            />
            <div className="flex gap-2">
              <button onClick={handleAddSubject} className="text-[10px] bg-[#6750A4] px-2 py-1 rounded text-white font-bold">Add</button>
              <button onClick={() => setIsAddingSubject(false)} className="text-[10px] text-gray-500">Cancel</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingSubject(true)}
            className="mt-8 flex items-center gap-2 text-xs font-bold text-[#6750A4] hover:brightness-110"
          >
            <Plus size={16} /> New Folder
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Study Notes</h2>
          <button 
            onClick={() => setIsAddingNote(true)}
            className="bg-[#6750A4] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={18} /> Take Note
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-3 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search through all your knowledge..." 
            className="w-full bg-[#252528] rounded-2xl py-2.5 px-12 border border-white/10 text-sm focus:outline-none focus:border-[#6750A4]"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-1 xl:grid-cols-2 gap-4 pb-20">
          {notes.filter(n => selectedSubject === 'All' || n.subject === selectedSubject).map(note => (
            <div key={note.id} className="bg-[#252528] p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col min-h-[220px] group cursor-pointer relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#6750A4]/10 flex items-center justify-center text-[#6750A4]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-[#6750A4] transition-colors">{note.title}</h4>
                    <p className="text-[10px] text-gray-500">{note.subject} • {note.timestamp?.toDate ? note.timestamp.toDate().toLocaleDateString() : 'Just now'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); togglePin(note.id, note.pinned); }}>
                    <Pin size={14} className={`${note.pinned ? 'text-[#6750A4] fill-[#6750A4]' : 'text-gray-600 hover:text-[#6750A4]'}`} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                    <Trash2 size={16} className="text-gray-600 hover:text-red-500" />
                  </button>
                </div>
              </div>
              
                <div 
                  className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed italic markdown-content"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              
              {note.attachments && note.attachments.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                  {note.attachments.map((att, idx) => (
                    <div key={idx} className="shrink-0 w-20 h-20 rounded-lg bg-black/20 border border-white/5 overflow-hidden flex items-center justify-center">
                      {att.type === 'image' ? (
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-[#6750A4]/10 w-full h-full flex flex-col items-center justify-center gap-1">
                          <Mic size={16} className="text-[#6750A4]" />
                          <span className="text-[8px] font-bold text-gray-400">Audio</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto flex justify-between items-center">
                <div className="flex gap-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">#{tag}</span>
                  ))}
                </div>
                <div className="flex gap-3 text-gray-500 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ImageIcon size={14} />
                  <Mic size={14} />
                  <Share2 size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isAddingNote && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsAddingNote(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-[#252528] border border-white/10 rounded-3xl p-8 z-[70] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create New Note</h3>
                <button onClick={() => setIsAddingNote(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <input 
                  type="text" 
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0 placeholder:text-gray-700"
                />
                
                <div className="flex gap-4 items-center">
                  <select 
                    value={newNote.subject}
                    onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    {subjects.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    {!subjects.includes('General') && <option value="General">General</option>}
                  </select>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Calendar size={14} /> Today, May 7
                  </div>
                </div>

                <div className="quill-editor-container">
                  <ReactQuill 
                    theme="snow"
                    value={newNote.content}
                    onChange={(content) => setNewNote({...newNote, content})}
                    modules={modules}
                    formats={formats}
                    placeholder="Start writing your brilliant study notes..."
                  />
                </div>

                {newNote.attachments && newNote.attachments.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    {newNote.attachments.map((att, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                        {att.type === 'image' ? (
                          <img src={att.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                             <Mic size={24} className="text-[#6750A4]" />
                             <span className="text-[10px] font-bold text-gray-400">Audio Attachment</span>
                          </div>
                        )}
                        <button 
                          onClick={() => removeAttachment(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isRecording && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-red-500 font-bold text-sm">Recording Audio...</span>
                    </div>
                    <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full">
                      <StopCircle size={20} />
                    </button>
                  </div>
                )}

                {audioUrl && !isRecording && (
                  <div className="bg-[#6750A4]/10 border border-[#6750A4]/20 rounded-2xl p-4 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Play size={20} className="text-[#6750A4]" />
                      <span className="text-[#6750A4] font-bold text-sm italic">New Recording Available</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addAudioAttachment} className="p-2 bg-[#6750A4] text-white rounded-xl text-xs font-bold">Attach</button>
                      <button onClick={() => setAudioUrl(null)} className="p-2 text-gray-400"><Trash2 size={18} /></button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center bg-[#252528]">
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    <Mic size={20} />
                  </button>
                  <button className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Tag size={20} />
                  </button>
                </div>
                
                <div className="flex gap-3">
                   <button 
                    onClick={() => setIsAddingNote(false)}
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-white"
                   >
                     Discard
                   </button>
                   <button 
                    onClick={saveNote}
                    disabled={!newNote.title || !newNote.content}
                    className="px-8 py-3 bg-[#6750A4] rounded-2xl text-sm font-bold text-white shadow-xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                   >
                     <Save size={18} /> Save Note
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
