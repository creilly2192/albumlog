const modal = document.getElementById('log-tape-modal') as HTMLElement
const overlay = modal.querySelector('.modal__overlay') as HTMLElement
const closeBtn = modal.querySelector('.modal__close') as HTMLButtonElement

function openModal(albumId: string) {
  modal.setAttribute('aria-hidden', 'false')
  modal.dataset.albumId = albumId
  ;(document.getElementById('modal-album-id') as HTMLInputElement).value = albumId
  const dateInput = document.getElementById('modal-date-listened') as HTMLInputElement
  if (!dateInput.value) dateInput.value = new Date().toISOString().split('T')[0]
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
  resetModal()
}

// --- Standout tracks ---
const standoutList = document.getElementById('standout-list') as HTMLUListElement
const standoutInput = document.getElementById('standout-input') as HTMLInputElement
const standoutAdd = document.getElementById('standout-add') as HTMLButtonElement

function addStandoutTrack(name: string) {
  if (!name.trim()) return
  const li = document.createElement('li')
  li.className = 'modal__track-item'
  li.innerHTML = `
    <span>${name}</span>
    <input type="hidden" name="standout_tracks" value="${name}" />
    <button type="button" class="modal__track-remove">&times;</button>
  `
  li.querySelector('.modal__track-remove')!.addEventListener('click', () => li.remove())
  standoutList.appendChild(li)
  standoutInput.value = ''
}

standoutAdd.addEventListener('click', () => addStandoutTrack(standoutInput.value))
standoutInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addStandoutTrack(standoutInput.value) }
})

// --- Favorite tracks ---
const favoriteList = document.getElementById('favorite-list') as HTMLUListElement
const favoriteInput = document.getElementById('favorite-input') as HTMLInputElement
const favoriteNoteInput = document.getElementById('favorite-note-input') as HTMLInputElement
const favoriteAdd = document.getElementById('favorite-add') as HTMLButtonElement
const favoriteTracksJson = document.getElementById('favorite-tracks-json') as HTMLInputElement

function syncFavoriteJson() {
  const items = Array.from(favoriteList.querySelectorAll('li')).map((li) => ({
    track_name: (li.querySelector('.modal__track-name') as HTMLElement).textContent ?? '',
    note: (li.querySelector('.modal__track-note') as HTMLElement).textContent ?? '',
  }))
  favoriteTracksJson.value = JSON.stringify(items)
}

function addFavoriteTrack(name: string, note: string) {
  if (!name.trim()) return
  const li = document.createElement('li')
  li.className = 'modal__track-item'
  li.innerHTML = `
    <span class="modal__track-name">${name}</span>
    <span class="modal__track-note">${note}</span>
    <button type="button" class="modal__track-remove">&times;</button>
  `
  li.querySelector('.modal__track-remove')!.addEventListener('click', () => {
    li.remove()
    syncFavoriteJson()
  })
  favoriteList.appendChild(li)
  favoriteInput.value = ''
  favoriteNoteInput.value = 'a perfect song'
  syncFavoriteJson()
}

favoriteAdd.addEventListener('click', () => addFavoriteTrack(favoriteInput.value, favoriteNoteInput.value))
favoriteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addFavoriteTrack(favoriteInput.value, favoriteNoteInput.value) }
})

// --- Reset on close ---
function resetModal() {
  standoutList.innerHTML = ''
  favoriteList.innerHTML = ''
  favoriteTracksJson.value = '[]'
  standoutInput.value = ''
  favoriteInput.value = ''
  favoriteNoteInput.value = 'a perfect song'
  const form = document.getElementById('log-tape-form') as HTMLFormElement
  form.reset()
  favoriteNoteInput.value = 'a perfect song'
  ;(document.getElementById('modal-date-listened') as HTMLInputElement).value = ''
}

overlay.addEventListener('click', closeModal)
closeBtn.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})

document.addEventListener('open-log-modal', (e: Event) => {
  openModal((e as CustomEvent<{ albumId: string }>).detail.albumId)
})
