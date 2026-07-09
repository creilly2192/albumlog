const modal = document.getElementById('log-tape-modal') as HTMLElement
const overlay = modal.querySelector('.modal__overlay') as HTMLElement
const closeBtn = modal.querySelector('.modal__close') as HTMLButtonElement

function openModal(albumId: string) {
  modal.setAttribute('aria-hidden', 'false')
  modal.dataset.albumId = albumId
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
}

overlay.addEventListener('click', closeModal)
closeBtn.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})

document.addEventListener('open-log-modal', (e: Event) => {
  openModal((e as CustomEvent<{ albumId: string }>).detail.albumId)
})
