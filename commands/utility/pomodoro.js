const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, entersState, getVoiceConnection } = require('@discordjs/voice');
const { audioPath } = require("../../config.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("pomodoro")
        .setDescription("Se conecta el bot al chat de voz")
        .addIntegerOption(option =>
            option.setName("work")
                .setDescription("Tiempo de trabajo de cada intervalo (minutos).")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("relax")
                .setDescription("Tiempo de relax de cada intervalo (minutos).")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("intervals")
                .setDescription("Cantidad de intervalos que se tienen que hacer.")
                .setRequired(true)),
    async execute(interaction) {
        // Get option values
        const tiempoTrabajo = interaction.options.get("work").value * 60000; // *60000 minutes to ms
        const tiempoRelax = interaction.options.get("relax").value * 60000; // *60000 minutes to ms
        const cantidadDeIntervalos = interaction.options.get("intervals").value;
        // Get some user info for messages
        const voiceChannel = interaction.member?.voice.channel;
        const channel = interaction.channel;
        const memberTagging = interaction.member.toString();
        let contadorDeIntervalos = 0;

        if (!voiceChannel) {
            await interaction.reply("Oops! You must be connected to a voice channel to use this command.");
            return;
        }

        // Stablish connection to a voice channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        // Create audio player
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });


        async function manejarIntervalos() {
            while (contadorDeIntervalos < cantidadDeIntervalos) {

                // Work intervals
                await new Promise((resolve) => setTimeout(async () => {
                    channel.send("Enough work, sleepy time " + memberTagging + " 😴");
                    const audio = createAudioResource(audioPath);
                    player.play(audio, { volume: 1 });
                    connection.subscribe(player);
                    resolve();
                }, tiempoTrabajo));


                // Relax intervals
                await new Promise((resolve) => setTimeout(async () => {
                    channel.send("HEY! get back to work right now " + memberTagging + "! 🤬");
                    const audio = createAudioResource(audioPath);
                    player.play(audio, { volume: 1 });
                    connection.subscribe(player);
                    resolve();
                }, tiempoRelax));

                contadorDeIntervalos++;
            }

            // Give some time to play the last sound and disconect
            setTimeout(() => {
                connection.destroy();
            }, 2000);
        }

        // Start intervals
        manejarIntervalos();
        await interaction.reply("Connected to voice chat, let's work!");
    },
};
