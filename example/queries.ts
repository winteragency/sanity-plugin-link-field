import {defineQuery} from 'groq'

export const demoLinkQuery = defineQuery(`*[_type == "demo"][0]{
  title,
  link {
    ...,
    internalLink->{_type, slug, title}
  }
}`)
