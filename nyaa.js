import { XMLParser } from "fast-xml-parser"

export default new class Nyaa {
  base = 'https://nyaa.si/?page=rss&q='

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = this.single
  movie = this.single

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) {
      query += ` ${episode.toString().padStart(2, '0')}`
    }

    const res = await fetch(this.base + encodeURIComponent(query))
    if (!res.ok) return []

    const xml = await res.text()

    const parser = new XMLParser({
      ignoreAttributes: false
    })

    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item
    if (!items) return []

    const list = Array.isArray(items) ? items : [items]

    return list.map(item => {
      const magnet = item.link

      return {
        title: item.title,
        link: magnet,
        hash: magnet?.match(/btih:([A-Fa-f0-9]+)/)?.[1] || '',
        seeders: Number(item['nyaa:seeders'] || 0),
        leechers: Number(item['nyaa:leechers'] || 0),
        downloads: Number(item['nyaa:downloads'] || 0),
        size: 0,
        date: new Date(item.pubDate),
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
