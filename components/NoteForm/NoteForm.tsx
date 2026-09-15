'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useNoteStore } from '@/lib/store/noteStore';
import { createNote } from '@/lib/api/clientApi';
import { NoteTag } from '@/types/note';
import css from './NoteForm.module.css';

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteStore();

  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setDraft({ [e.target.name]: e.target.value });
  };


  const handleSubmit = async (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    

    const tag = formData.get('tag') as NoteTag;

    try {
      await createNote({ title, content, tag });
      
    
      clearDraft();
      
      
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      
      
      router.push('/notes/filter/all');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  
  const handleCancel = () => {
    router.back();
  };

  return (
    <form action={handleSubmit} className={css.form}>
      <label className={css.label}>
        Title
        <input
          type="text"
          name="title"
          defaultValue={draft.title}
          onChange={handleChange}
          required
          className={css.input}
        />
      </label>

      <label className={css.label}>
        Content
        <textarea
          name="content"
          defaultValue={draft.content}
          onChange={handleChange}
          required
          className={css.textarea}
        />
      </label>

      <label className={css.label}>
        Tag
        <select
          name="tag"
          defaultValue={draft.tag}
          onChange={handleChange}
          className={css.select}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </label>

      <div className={css.actions}>
        <button type="submit" className={css.submitBtn}>
          Save Note
        </button>
        <button type="button" onClick={handleCancel} className={css.cancelBtn}>
          Cancel
        </button>
      </div>
    </form>
  );
}
