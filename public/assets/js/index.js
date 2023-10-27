document.addEventListener('DOMContentLoaded', () => {
  let noteForm;
  let noteTitle;
  let noteText;
  let saveNoteBtn;
  let newNoteBtn;
  let noteList;

  if (window.location.pathname === '/notes') {
    noteForm = document.querySelector('.note-form');
    noteTitle = document.querySelector('.note-title');
    noteText = document.querySelector('.note-textarea');
    saveNoteBtn = document.querySelector('.save-note');
    newNoteBtn = document.querySelector('.new-note');
    noteList = document.querySelectorAll('.list-container .list-group');

    const clearFormButton = document.querySelector('.clear-btn');
    if (clearFormButton) {
      clearFormButton.addEventListener('click', () => {
        noteTitle.value = '';
        noteText.value = '';
        activeNote = {};
        handleRenderBtns();
      });
    }
  }

  const show = (elem) => elem.style.display = 'inline';
  const hide = (elem) => elem.style.display = 'none';

  let activeNote = {};

  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    });

  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  
  const renderActiveNote = () => {
    hide(saveNoteBtn);
    if (activeNote.id) {
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
      show(newNoteBtn);
    } else {
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
      hide(newNoteBtn);
    }
  };

  const handleNoteSave = async () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value
    };
    const response = await saveNote(newNote);
    if (response.ok) {
      const savedNote = await response.json();
      activeNote = savedNote;
      await getAndRenderNotes();
      renderActiveNote();
    }
  };

  const handleNoteDelete = (e) => {
    e.stopPropagation();
    const note = e.target;
    const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    });
  };

  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.closest('.list-group-item').getAttribute('data-note'));
    renderActiveNote();
  };

  const handleNewNoteView = () => {
    activeNote = {};
    renderActiveNote();
  };

  const handleRenderBtns = () => {
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(saveNoteBtn);
    } else if (noteTitle.getAttribute('readonly') && noteText.getAttribute('readonly')) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === '/notes') {
      noteList.forEach((el) => (el.innerHTML = ''));
    }

    let noteListItems = [];

    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  };

  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  if (window.location.pathname === '/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    noteForm.addEventListener('input', handleRenderBtns);
    newNoteBtn.addEventListener('click', handleNewNoteView);
  }

  getAndRenderNotes();
});
