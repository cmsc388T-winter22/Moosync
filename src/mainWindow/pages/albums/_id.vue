<!-- 
  _id.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<route>
{
  "props": true
}
</route>
<template>
  <div class="w-100 h-100">
    <SongView
      :defaultDetails="defaultDetails"
      :songList="songList"
      :detailsButtonGroup="buttonGroups"
      @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)"
      @playAll="playAlbum"
      @addToQueue="addAlbumToQueue"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/songView/SongView.vue'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import RemoteSong from '@/utils/ui/mixins/remoteSongMixin'
import { arrayDiff } from '@/utils/common'

@Component({
  components: {
    SongView
  }
})
export default class SingleAlbumView extends mixins(ContextMenuMixin, PlayerControls, RemoteSong) {
  private album: Album | null = null
  private songList: Song[] = []

  get buttonGroups(): SongDetailButtons {
    return {
      enableContainer: true,
      enableLibraryStore: false
    }
  }

  get defaultDetails(): SongDetailDefaults {
    return {
      defaultTitle: this.album?.album_name,
      defaultSubtitle: this.album?.album_artist,
      defaultSubSubtitle: `${this.album?.album_song_count} Songs`,
      defaultCover: this.album?.album_coverPath_high
    }
  }

  created() {
    this.fetchAlbum()
    this.fetchSongList()
  }

  private async fetchAlbum() {
    this.album = (
      await window.SearchUtils.searchEntityByOptions({
        album: {
          album_id: this.$route.params.id
        }
      })
    )[0]
  }

  private async fetchSongList() {
    this.songList = await window.SearchUtils.searchSongsByOptions({
      album: {
        album_id: this.$route.params.id
      },
      sortBy: vxm.themes.sortBy
    })
  }

  private sort(options: sortOptions) {
    vxm.themes.sortBy = options
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, {
      type: 'SONGS',
      args: {
        songs: songs,
        exclude: exclude,
        sortOptions: { callback: this.sort, current: vxm.themes.sortBy },
        refreshCallback: () => (this.songList = arrayDiff(this.songList, songs))
      }
    })
  }

  private playAlbum() {
    this.playTop(this.songList)
  }

  private addAlbumToQueue() {
    this.queueSong(this.songList)
  }
}
</script>
