<template>
  <GithubReleases v-slot="{ releases }">
    <div
      v-for="release in releases"
      :key="release.name"
    >
      <ProseH2 :id="release.name">
        <Badge :type="release.prerelease ? 'warning' : 'info'">
          {{ release.prerelease ? "Pre-release" : "Release" }}
        </Badge>{{ release.name }}
      </ProseH2>
      <details>
        <summary>
          Published on {{ new Date(release.date).toDateString() }}
        </summary>
        <ContentRenderer :value="release" />
      </details>
    </div>
  </GithubReleases>
</template>
