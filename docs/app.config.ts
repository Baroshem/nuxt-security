export default defineAppConfig({
  github: {
    owner: 'Baroshem',
    repo: 'nuxt-security',
    branch: 'main'
  },
  docus: {
    title: 'Nuxt Security',
    description: '🛡️ Security Module for Nuxt based on HTTP Headers and Middleware',
    image: '/preview.jpg',
    url: 'https://nuxt-security.vercel.app',
    socials: {
      twitter: 'jacobandrewsky',
      github: 'baroshem/nuxt-security',
      nuxt: {
        label: 'Nuxt',
        icon: 'simple-icons:nuxtdotjs',
        href: 'https://nuxt.com'
      }
    },
    aside: {
      level: 1
    },
    github: {
      dir: 'docs/content',
      root: 'docs/content',
      edit: true,
      releases: true,
      owner: 'baroshem',
      repo: 'nuxt-security',
      branch: 'main'
    },
    cover: {
      src: '/preview.png',
      alt: 'Security Module for Nuxt based on HTTP Headers and Middleware'
    },
    header: {
      logo: true
    }
  }
})
