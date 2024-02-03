type Item = {
  publishedfileid: string
  sortorder: number
  filetype: number
}

const collectionId = "2875501250"
const response = await fetch(
  `https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/?format=json`,
  {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: `collectioncount=1&publishedfileids[0]=${collectionId}`,
  }
)
const data = await response.json()

const items = data.response.collectiondetails[0].children

const workshopItems = await Promise.all(
  items.map((item: Item) => {
    return new Promise((resolve) => {
      fetch(
        `https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/?format=json`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `itemcount=1&publishedfileids[0]=${item.publishedfileid}`,
        }
      ).then(async (response) => {
        const data = await response.json()
        resolve(data.response.publishedfiledetails)
      })
    })
  })
)

const workshopMaps = workshopItems.map((workshopItem) => {
  const item = workshopItem[0]

  return {
    Name: item.title,
    DisplayName: item.title,
    Id: item.publishedfileid,
    Workshop: true,
  }
})

const config = {
  MapCycle: {
    RandomOrder: false,
    MapChangeAtTheEndOfMatchDelay: 19,
  },
  Maps: [
    {
      Name: "de_nuke",
      DisplayName: "de_nuke",
      Id: "de_nuke",
      Workshop: false,
    },
    ...workshopMaps,
  ],
  Rtv: {
    Enabled: true,
    AutoVoteEnabled: true,
    AutoVoteTimeStartInSeconds: 0,
    AutoVoteRoundStart: 3,
    AutoVoteStartAtTheEndOfMatch: false,
    PlayerCommandEnabled: true,
    PlayerCommandTriggerAVote: true,
    PlayerCommandRatioEnabled: true,
    PlayerCommandRatio: 0.6,
    PlayerCommandChangeTheMapDirectlyAfterVote: true,
    VoteMapCount: 6,
    VoteDurationInSeconds: 30,
    VoteRatioEnabled: true,
    VoteRatio: 0.6,
    ExtendMap: true,
  },
  ConfigVersion: 2,
}

await Deno.writeTextFile("MapCycle.json", JSON.stringify(config))
