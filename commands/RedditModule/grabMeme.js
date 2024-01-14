const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const snoowrap = require("snoowrap");
const appRoot = require("app-root-path");

const config = require(appRoot + "/config.json");

const reddit = new snoowrap({
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  clientId: config.reddit[0].clientId,
  clientSecret: config.reddit[0].clientSecret,
  refreshToken: config.reddit[0].refreshToken,
});

async function getRandomPost(
  subreddit,
  getImage,
  retryCount = 0,
  videoRetryCount = 0
) {
  try {
    if (reddit.getSubreddit(subreddit).over_18 == true) {
      console.log("NSFW sub, returning...");
      return {
        isNSFWSubreddit: true,
      };
    }

    const randomPost = await reddit.getRandomSubmission(subreddit);

    if (randomPost.over_18 == true && retryCount < 5) {
      console.log("Post is NSFW, finding another post...");
      return getRandomPost(
        subreddit,
        getImage,
        retryCount + 1,
        videoRetryCount
      );
    }

    if (retryCount >= 5 || randomPost.over_18 == true) {
      console.log("Post is NSFW. Returning NSFW warn.");
      return {
        isNSFW: true,
      };
    }

    if (getImage && randomPost.is_reddit_media_domain && !randomPost.is_video) {
      return {
        title: randomPost.title,
        upvotes: randomPost.ups,
        url: randomPost.url,
        author: randomPost.author.name,
        isNSFW: false,
      };
    }

    if (!getImage && randomPost.is_self && !randomPost.is_video) {
      return {
        title: randomPost.title,
        upvotes: randomPost.ups,
        body: randomPost.selftext,
        author: randomPost.author.name,
        isNSFW: false,
      };
    }

    if (randomPost.is_video && videoRetryCount < 5) {
      console.log("Post is a video, finding another post...");
      return getRandomPost(
        subreddit,
        getImage,
        retryCount,
        videoRetryCount + 1
      );
    }

    if (randomPost.is_video) {
      return {
        isVideo: true,
      };
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Returns a random meme from r/memes.")
    .addStringOption((option) =>
      option
        .setName("subreddit")
        .setDescription(
          "The subreddit you'd like your meme from. Default is r/memes."
        )
        .setRequired(false)
        .addChoices(
          { name: "r/memes", value: "memes" },
          { name: "r/wholesomememes", value: "wholesomememes" },
          { name: "r/dankmemes", value: "dankmemes" },
          { name: "r/funny", value: "funny" },
          { name: "r/animemes", value: "animemes" }
        )
    ),

  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;

    const getImage = true;
    var subreddit = "memes";

    if (
      interaction.options.getString("subreddit") == null ||
      interaction.options.getString("subreddit") == ""
    ) {
      subreddit = "memes";
    } else {
      subreddit = interaction.options.getString("subreddit");
    }

    getRandomPost(subreddit, getImage)
      .then((result) => {
        if (result.isVideo) {
          const redditErrorEmbed = new EmbedBuilder()
            .setColor(0xf95d5d)
            .setTitle("I cannot browse videos.")
            .setDescription("Unfortunately, I cannot browse videos.")
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditErrorEmbed] });
        } else if (result.isNSFWSubreddit) {
          const redditErrorEmbed = new EmbedBuilder()
            .setColor(0xf95d5d)
            .setTitle("I cannot browse NSFW subreddits.")
            .setDescription("Unfortunately, I cannot browse NSFW subreddits.")
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditErrorEmbed] });
        } else if (result.isNSFW) {
          const redditErrorEmbed = new EmbedBuilder()
            .setColor(0xf95d5d)
            .setTitle("I cannot browse NSFW...")
            .setDescription("Unfortunately, I cannot fetch NSFW posts.")
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditErrorEmbed] });
        } else if (result && getImage) {
          const redditEmbed = new EmbedBuilder()
            .setColor(0x3fa659)
            .setTitle(result.title)
            .setURL(result.url)
            .setImage(result.url)
            .addFields(
              { name: "Upvotes", value: `${result.upvotes}`, inline: true },
              { name: "Author", value: `u/${result.author}`, inline: true },
              { name: "Subreddit", value: `r/${subreddit}`, inline: true }
            )
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditEmbed] });
        } else {
          const redditErrorEmbed = new EmbedBuilder()
            .setColor(0xf95d5d)
            .setTitle("No suitable posts found...")
            .setDescription(
              "Unfortunately, there are no suitable posts available."
            )
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditErrorEmbed] });
        }
      })
      .catch((error) => {
        const redditErrorEmbed = new EmbedBuilder()
          .setColor(0xffe838)
          .setTitle("An error occurred.")
          .setDescription(
            "Unfortunately, I cannot fetch posts right now. Try again later?"
          )
          .setTimestamp()
          .setFooter({
            text: `Sent by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        interaction.editReply({ embeds: [redditErrorEmbed] });

        console.log(error);
      });
  },
};
