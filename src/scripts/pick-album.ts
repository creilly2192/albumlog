document.querySelectorAll<HTMLLIElement>('.pick-next__item-btn').forEach((item) => {
    item.addEventListener('click', async () => {
        const albumId = item.dataset.albumId!
        const body = new URLSearchParams({ album_id: albumId })
        await fetch('/api/set-now-playing', { method: 'POST', body })
        window.location.href = '/'
    })
})