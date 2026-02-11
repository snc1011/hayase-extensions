export default new class Nyaa {
  base = 'http://localhost:3000/api/nyaa?q='

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = this.single
  movie = this.single

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`

    const res = await fetch(this.base + encodeURIComponent(query))
    if (!res.ok) return []

    const xmlText = await res.text()

    const parser = new DOMParser()
    const xml = parser.parseFromString(xmlText, "text/xml")

    const items = Array.from(xml.querySelectorAll("item"))
    if (!items.length) return []

    return items.map(item => {
      const get = tag =>
        item.getElementsByTagName(tag)[0]?.textContent || ""

      const magnet = get("link")

      return {
        title: get("title"),
        link: magnet,
        hash: magnet.match(/btih:([A-Fa-f0-9]+)/)?.[1] || '',
        seeders: Number(get("nyaa:seeders") || 0),
        leechers: Number(get("nyaa:leechers") || 0),
        downloads: Number(get("nyaa:downloads") || 0),
        size: 0,
        date: new Date(get("pubDate")),
        accuracy: 'medium',
        type: 'alt'
      }
    })
  }

  async test() {
    const res = await fetch(this.base + 'one%20piece')
    return res.ok
  }
}()
