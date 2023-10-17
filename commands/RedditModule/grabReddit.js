const colours = require("colors");
colours.enable();

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const snoowrap = require("snoowrap");
const appRoot = require("app-root-path");

const config = require(appRoot + "/config.json");

const reddit = new snoowrap({
  userAgent: "electra discord bot",
  clientId: config.reddit[0].clientId,
  clientSecret: config.reddit[0].clientSecret,
  refreshToken: config.reddit[0].refreshToken,
});

async function getRandomPost(subreddit, getImage, retryCount = 0) {
  try {
    if (reddit.getSubreddit(subreddit).over_18 == true) {
      return {
        isNSFWSubreddit: true,
      };
    }

    const randomPost = await reddit.getRandomSubmission(subreddit);

    if (randomPost.over_18 == true && retryCount < 5) {
      return getRandomPost(subreddit, getImage, retryCount + 1);
    }

    if (retryCount >= 5 || randomPost.over_18 == true) {
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

    if (!getImage && randomPost.is_self) {
      return {
        title: randomPost.title,
        upvotes: randomPost.ups,
        body: randomPost.selftext,
        author: randomPost.author.name,
        isNSFW: false,
      };
    }

    if (randomPost.is_video) {
      return {
        isVideo: true,
      };
    }

    return getRandomPost(subreddit, getImage, retryCount);
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reddit")
    .setDescription("Returns a random post form your specified subreddit.")
    .addStringOption((option) =>
      option
        .setName("subreddit")
        .setDescription("The subreddit you'd like the bot to search.")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("returnimage")
        .setDescription(
          "Whether you would like the bot to return an image or not."
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;

    const getImage = interaction.options.getBoolean("returnimage");
    const subreddit = interaction.options.getString("subreddit");

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
        } else if (result && result.isNSFW) {
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
        } else if (result && !result.isNSFW) {
          const redditTextEmbed = new EmbedBuilder()
            .setColor(0x3fa659)
            .setTitle(result.title)
            .setDescription(result.body)
            .setURL(result.url)
            .addFields(
              { name: "Upvotes", value: `${result.upvotes}`, inline: true },
              { name: "Author", value: `u/${result.author}`, inline: true }
            )
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          interaction.editReply({ embeds: [redditTextEmbed] });
        } else if (result && getImage) {
          const redditEmbed = new EmbedBuilder()
            .setColor(0x3fa659)
            .setTitle(result.title)
            .setImage(result.url)
            .setURL(result.url)
            .addFields(
              { name: "Upvotes", value: `${result.upvotes}`, inline: true },
              { name: "Author", value: `u/${result.author}`, inline: true }
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
          .setDescription("Unfortunately, I cannot fetch posts.")
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
