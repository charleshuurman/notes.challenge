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
    noteList = document.querySelector('.list-group'); // Use querySelector instead of querySelectorAll
  }

  // activeNote is used to keep track of the note in the textarea
  let activeNote = {};

  const show = (elem) => {
    if (elem) {
      elem.style.display = 'inline';
    }
  };

  const hide = (elem) => {
    if (elem) {
      elem.style.display = 'none';
    }
  };

  // Show an element
  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(newNoteBtn); // Hide the "New Note" button when a note is active

    if (activeNote.id) {
      noteTitle.setAttribute('readonly', true);
      noteText.setAttribute('readonly', true);
      noteTitle.value = activeNote.title;
      noteText.value = activeNote.text;
    } else {
      noteTitle.removeAttribute('readonly');
      noteText.removeAttribute('readonly');
      noteTitle.value = '';
      noteText.value = '';
    }
  };

  const getNotes = () =>
    fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });

  const renderNoteList = async (notes) => {
    let jsonNotes = await notes.json();
    if (window.location.pathname === '/notes') {
      noteList.innerHTML = ''; // Clear the note list
    }

    let noteListItems = [];

    const createLi = (text) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView); // Attach event listener to each note

      liEl.append(spanEl);
      return liEl;
    };

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes'));
    }

    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);
      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList.append(note)); // Append notes to the list
    }
  };

  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  if (window.location.pathname === '/notes') {
    saveNoteBtn.addEventListener('click', handleNoteSave);
    newNoteBtn.addEventListener('click', handleNewNoteView);
    noteForm.addEventListener('input', handleRenderBtns);
  }

  // Attach event listener for note clicks using event delegation
  document.querySelector('.list-group').addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('list-item-title') || target.parentElement.classList.contains('list-item-title')) {
      handleNoteView(event);
    }
  });

  // Handle click on existing note
  const handleNoteView = (e) => {
    e.preventDefault();
    const noteElement = e.target.classList.contains('list-item-title') ? e.target.parentElement : e.target;
    activeNote = JSON.parse(noteElement.getAttribute('data-note'));
    renderActiveNote();
    show(newNoteBtn); // Show the "New Note" button
  };

  // Other functions remain unchanged

  getAndRenderNotes();
});
