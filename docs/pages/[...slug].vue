<script setup lang="ts">
definePageMeta({
  layout: 'docs',
  key: route => route.path,
})
const route = useRoute()

const { data: content } = await useFetch('/api/docs', {
  query: computed(() => ({ path: route.path.replace(/\/$/, '') })),
})
const page = computed(() => content.value?.page)
const surround = computed(() => content.value?.surround || [])

useSeoMeta({
  titleTemplate: '%s - Nuxt Security',
  title: page?.value?.title,
  ogTitle: `${page?.value?.title} - Nuxt Security`,
  description: page?.value?.description,
  ogDescription: page?.value?.description,
})

const headline = computed(() =>
  page?.value ? page.value.title : 'Nuxt Security Headline',
)
const communityLinks = computed(() => [
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/Baroshem/nuxt-security/edit/main/docs/content/${page?.value?.stem}.md`,
    target: '_blank',
  },
  {
    icon: 'i-ph-shooting-star-duotone',
    label: 'Star on GitHub',
    to: 'https://github.com/Baroshem/nuxt-security',
    target: '_blank',
  },
  {
    icon: 'i-ph-chat-centered-text-duotone',
    label: 'Chat on Discord',
    to: 'https://chat.nuxt.dev',
    target: '_blank',
  },
  {
    icon: 'i-ph-hand-heart-duotone',
    label: 'Become a Sponsor',
    to: 'https://github.com/sponsors/nuxt',
    target: '_blank',
  },
  {
    icon: 'i-simple-icons-nuxtdotjs',
    label: 'Nuxt docs',
    to: 'https://nuxt.com',
    target: '_blank',
  },
])
</script>

<template>
  <UPage>
    <UPageHeader
      :title="page?.title"
      :description="page?.description"
      :links="page?.links"
      :headline="headline"
    />

    <UPageBody
      prose
      class="pb-0"
    >
      <ContentRenderer
        v-if="page?.body"
        :value="page"
      />
      <hr
        v-if="surround?.length"
        class="my-8"
      >
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc :links="page.body.toc.links">
        <template #bottom>
          <div class="hidden !mt-6 lg:block space-y-6">
            <USeparator
              v-if="page.body?.toc?.links?.length"
              dashed
            />
            <UPageLinks
              title="Community"
              :links="communityLinks"
            />
          </div>
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
