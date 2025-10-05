/**
 * @name ProfileRestructure
 * @author KingGamingYT
 * @description i hate profile v2 grahhhhh
 * @version 0.0.1
 */ 

const { Data, Webpack, React, ReactUtils, Patcher, DOM, UI, Utils, Components } = BdApi;
const { createElement, useState, useRef, useMemo } = React;

const profileModal = Webpack.getMangled("clickableUsername", {user: x=>x.toString?.().includes('==')});
const entireProfileModal = [...BdApi.Webpack.getWithKey(BdApi.Webpack.Filters.byStrings(".reduceAdaptiveTheme", ".Provider"))][0];
const RelationshipStore = Webpack.getStore('RelationshipStore');
const ActivityStore = Webpack.getStore("PresenceStore");
const UserStore = Webpack.getStore("UserStore");
const ChannelStore = Webpack.getStore("ChannelStore");
const GuildStore = Webpack.getStore("GuildStore");
const StreamStore = Webpack.getStore('ApplicationStreamingStore');
const UserProfileStore = Webpack.getStore('UserProfileStore');
const ApplicationStore = Webpack.getStore('ApplicationStore');
const ApplicationStreamPreviewStore = Webpack.getStore('ApplicationStreamPreviewStore');
const VoiceStateStore = Webpack.getStore('VoiceStateStore');
const GuildMemberStore = Webpack.getStore('GuildMemberStore');
const { useStateFromStores } = Webpack.getMangled(m => m.Store, {
        useStateFromStores: Webpack.Filters.byStrings("useStateFromStores")
        }, { raw: true });
const NavigationUtils = Webpack.getMangled("transitionTo - Transitioning to", {
    transitionTo: Webpack.Filters.byStrings("\"transitionTo - Transitioning to \""),
    replace: Webpack.Filters.byStrings("\"Replacing route with \""),
    goBack: Webpack.Filters.byStrings(".goBack()"),
    goForward: Webpack.Filters.byStrings(".goForward()"),
    transitionToGuild: Webpack.Filters.byStrings("\"transitionToGuild - Transitioning to \"")
});
const ModalAccessUtils = Webpack.getModule(x=>x.openUserProfileModal);
const intl = Webpack.getModule(x=>x.t && x.t.formatToMarkdownString);
const IconUtils = Webpack.getByKeys("getGuildIconURL");
const avatarFetch = Webpack.getByStrings('displayProfile', 'onOpenProfile', 'animateOnHover', 'previewStatus');
const EmojiRenderer = Webpack.getByStrings('translateSurrogatesToInlineEmoji');
const MutualFriendRenderer = Webpack.getByStrings('UserProfileMutualFriendRow');
const MutualServerRenderer = Webpack.getByStrings('hasAvatarForGuild', 'nick');
const ActivityTimer = Webpack.getByStrings("UserProfileActivityBadges", {searchExports: true});
const MediaProgressBar = Webpack.getByStrings('start', 'end', 'duration', 'percentage');
const ActivityButtons = Webpack.getByStrings('activity', 'onAction', 'application_id', 'INSTANCE');
const SpotifyButtons = Webpack.getByStrings('activity', 'PRESS_PLAY_ON_SPOTIFY_BUTTON');
const CallButtons = Webpack.getByStrings('PRESS_JOIN_CALL_BUTTON');
const VoiceBox = Webpack.getByStrings('users', 'channel', 'themeType');
const VoiceList = Webpack.getByStrings('maxUsers', 'guildId');
const VoiceIcon = Webpack.getByStrings('channel', 'isGuildStageVoice', 'isDM', 'Pl.CONNECT');
const TagGuildRenderer = Webpack.getByStrings('guildId', 'name', 'setPopoutRef', 'onClose', 'fetchGuildProfile');
const RoleRenderer = Webpack.getByStrings('guildMember', 'roles', 'canManageRoles');
const Tooltip = Webpack.getModule(Webpack.Filters.byPrototypeKeys("renderTooltip"), { searchExports: true });
const Popout = Webpack.getByStrings("Unsupported animation config:", {searchExports: true});
const FormSwitch = Webpack.getByStrings('ERROR','tooltipNote', { searchExports: true });

const settings = {
    main: {
        showGuildTag: {
            name: "Show user guild tag",
            note: "Displays a user's guild tag under their pfp.",
            default: true,
            changed: (v) => {
                if (v)
                    return true;
                else
                    return false;
            }
        },
        disableDiscrim: {
            name: "Disable discriminators",
            note: "Don't like legacy discriminators? This will always display a user's modern @ tag.",
            default: false,
            changed: (v) => {
                if (v)
                    return true;
                else
                    return false;
            }
        }
    },
    serverCategory: {
        showRoles: {
            name: "Show member roles",
            note: "When viewing a user's profile in a server, that user's roles will be visible in the user's profile details.",
            default: true,
            changed: (v) => {
                if (v)
                    return true;
                else
                    return false;
            }
        },
        serverBio: {
            name: "Show server about me",
            note: "When viewing a user's profile in a server, that user's custom about me will be displayed instead of their default one.",
            default: true,
            changed: (v) => {
                if (v)
                    return true;
                else
                    return false;
            }
        },
    }
};

const TooltipBuilder = ({ note, position, children }) => {
    return (
        React.createElement(Tooltip, {
            text: note,
            position: position || "top",
        }, props => {
            children.props = {
                ...props,
                ...children.props
            };
            return children;
        })
    );
};

/* Lazy-Loaded Components */
let buttonFetch;
let markdownFormat;
let badgeFetch;
let NoteRenderer;
let ConnectionRenderer;

function buttonComponent({user, currentUser, relationshipType}) {
    buttonFetch ??= Webpack.getByStrings('gameFriends', 'PENDING_OUTGOING', 'hasIncomingPendingGameFriends', 'onClose');

    return createElement(buttonFetch, {user, currentUser, relationshipType});
}
function markdownComponent({userBio}) {
    markdownFormat ??= Webpack.getByStrings('userBio', 'markup');

    return createElement(markdownFormat, {className: "userBio", userBio});
}
function badgeComponent({badges}) {
    badgeFetch ??= Webpack.getByStrings('pendingBadges', 'pendingLegacyUsernameDisabled');

    return createElement('div', {className: "profileBadges", style: { display: "flex", flexWrap: "wrap" },
        children: createElement(badgeFetch, {pendingBadges: badges})
    });
}
function noteComponent({userId}) {
    NoteRenderer ??= Webpack.getByStrings('hidePersonalInformation', 'onUpdate', 'placeholder');

    return createElement(NoteRenderer, {className: "note", userId});
}
function connectionComponent({connectedAccount, userId}) {
    ConnectionRenderer ??= Webpack.getByStrings('connectedAccount', 'connectedAccountOpenIcon', 'CONNECTED_ACCOUNT_VIEWED', {searchExports: true});

    return createElement(ConnectionRenderer, {className: "connectedAccount", connectedAccount, userId});
}

const tabs = {
    ABOUT: 0,
    SERVERS: 1,
    FRIENDS: 2,
};

const headers = {
    0: intl.intl.formatToPlainString(intl.t['iKo3yM']), // playing
    1: intl.intl.formatToPlainString(intl.t['4CQq9f'], { name: '' }), // streaming
    2: intl.intl.formatToPlainString(intl.t['NF5xoq'], { name: '' }), // listening
    3: intl.intl.formatToPlainString(intl.t['pW3Ip6'], { name: '' }), // watching
    5: intl.intl.formatToPlainString(intl.t['QQ2wVF'], { name: '' }) // competing
};

function BioBuilder({displayProfile}) {
    if (displayProfile?._guildMemberProfile?.bio && Data.load('ProfileRestructure', 'serverBio')) {
        return [createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['NepzEx'])), createElement(markdownComponent, {userBio: displayProfile.bio})]
    }
    else if (displayProfile._userProfile.bio) {
        return [createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['NepzEx'])), createElement(markdownComponent, {userBio: displayProfile._userProfile.bio})]
    }
    return;
}
function RoleBuilder({user, data}) {
    if (!data?.guildId || !Data.load('ProfileRestructure', 'showRoles')) {
        return;
    }
    const serverMember = GuildMemberStore.getMember(data?.guildId, user.id);
    if (serverMember?.roles?.length === 0) {
        return;
    }
    return [
        serverMember?.roles?.length !== 1 ? createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['LPJmLy']))
        : createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['IqVT2N'])),
        createElement(RoleRenderer, { user: user, currentUser: data.currentUser, guild: GuildStore.getGuild(data?.guildId)})
    ]
}
function MemberDateBuilder({data, user}) {
    const server = GuildStore.getGuild(data?.guildId);
    const serverDate = new Date(GuildMemberStore.getMember(data?.guildId, user.id)?.joinedAt);
    return [
        createElement('div', {className: "memberSince", style: {color: "var(--text-default)"}}, user.createdAt.toString().substring(3, 7) + " " + user.createdAt.getDate() + ", " + user.createdAt.toString().substring(11, 15)),
        data?.guildId && [
            createElement('div', {className: "divider" }),
            createElement(TooltipBuilder, { note: server.name, children: 
                createElement('div', { className: "guildIcon" }, 
                    createElement('img', { src: IconUtils.getGuildIconURL(server) + 'size=16' })
            )}),
            createElement('div', {className: "memberSinceServer", style: {color: "var(--text-default)"}}, serverDate.toString().substring(3, 7) + " " + serverDate.getDate() + ", " + serverDate.toString().substring(11, 15))
        ]
    ]
}
function ClanTagBuilder({user}) {
    if (!user.primaryGuild?.tag || !Data.load('ProfileRestructure', 'showGuildTag')) {
        return;
    }
    const [showPopout, setShowPopout] = useState(false);
    const refDOM = useRef(null);
    return  (
        createElement('div', { className: "clanTagContainer", onMouseLeave: () => { setShowPopout(false) },
            children:
                createElement(Popout, { targetElementRef: refDOM, renderPopout: () =>  createElement(TagGuildRenderer, { guildId: user.primaryGuild?.identityGuildId }), position: "right", shouldShow: showPopout, 
                    children: (props) =>
                        createElement('div', { ...props, className: "clanTag", ref: refDOM, onClick: () => { setShowPopout(true) },
                            children: 
                                createElement('div', { className: "clanTagInner", 
                                    children: [
                                        createElement('img', { className: "tagBadge", src: 'https://cdn.discordapp.com/clan-badges/' + user.primaryGuild?.identityGuildId + '/' + user.primaryGuild?.badge + '.png?size=16' }),
                                        createElement('div', { className: "tagName", style: { color: "var(--text-default)", lineHeight: "16px", fontWeight: "600", fontSize: "14px" } }, user.primaryGuild?.tag)
                                    ]
                                }
                            )
                        }
                    )
                }
            )
        }
    ))
}
function ConnectionCards({user, connections}) {
    if (!connections.length == 0) {
        return createElement('div', {className: "connectedAccounts", 
                children:
                    connections.map(connection => createElement(connectionComponent, {connectedAccount: connection, userId: user.id}))
        })
    }
    return;
}
function activityCheck({activities}) {
    let pass = {
        playing: 0,
        xbox: 0,
        playstation: 0,
        streaming: 0,
        listening: 0,
        spotify: 0,
        watching: 0,
        competing: 0,
        custom: 0
    };
    for (let i = 0; i < activities.length; i++) {
        if (activities[i].type == 4) {
            pass.custom = 1;
        }
        if (activities[i].type == 0) {
            pass.playing = 1;
        }
        if (activities[i]?.platform?.includes("xbox")) {
            pass.xbox = 1;
        }
        if (activities[i]?.platform?.includes("playstation") || activities[i]?.platform?.includes("ps5")) {
            pass.playstation = 1;
        }
        if (activities[i].type == 1) {
            pass.streaming = 1;
        }
        if (activities[i].type == 2) {
            pass.listening = 1;
        }
        if (activities[i].name.includes("Spotify")) {
            pass.spotify = 1;
        }
        if (activities[i].type == 3) {
            pass.watching = 1;
        }
        if (activities[i].type == 5) {
            pass.competing = 1;
        }
    }
    return pass;
}
function userVoice({voice}) {
    let participants = [];
    const channelParticipants = Object.keys(VoiceStateStore.getVoiceStatesForChannel(voice));
    for (let i = 0; i < channelParticipants.length; i++) {
        participants.push(UserStore.getUser(channelParticipants[i]))
    }
    return participants;
}
function CustomCards({activities}) {
    const _activities = activities.filter(activity => activity && activity.type === 4);
    const _emoji = activities.filter(activity => activity.emoji);

    return _activities.map(activity => React.createElement("div", {
        className: "activity",
        children: [
            React.createElement("div", { className: "activityHeader" }, activity.name),
            React.createElement("div", { 
                className: "customStatusContent",
                children: [
                    _emoji.map(emoji => React.createElement(EmojiRenderer, { emoji: activity.emoji })),
                    React.createElement("div", { className: "customStatusText" }, activity.state),
                ]
            })
        ]
    }))
}
function ActivityCards({user, activities, voice, stream}) {
    const _activities = activities.filter(activity => activity && (activity?.type === 0 || activity?.type === 2 || activity?.type === 5 || activity?.type === 3) && activity?.type !== 4 && activity.name && !activity.name.includes("Spotify"));
    return createElement('div', { className: "activityProfileContainer activityProfileContainerNormal", 
    children: [
        !stream ? createElement(VoiceCards, {user, voice, stream}) : createElement(StreamCards, {user, voice}), 
        _activities.map(activity => createElement('div', {className: "activityProfile activity", 
        children: [
            activityCheck({activities})?.listening === 1 && activity.type === 2 ? createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, headers[activity.type] + activity?.name) 
            : (activityCheck({activities})?.xbox === 1 || activityCheck({activities})?.playstation === 1) && (activity?.platform?.includes('xbox') || (activity?.platform?.includes('playstation') || (activity?.platform?.includes('ps5'))))  ? createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, intl.intl.formatToPlainString(intl.t['A17aMz'], { platform: activity?.platform })) 
            : createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, headers[activity.type]),
            createElement('div', {className: "bodyNormal", style: { display: "flex", alignItems: "center", width: "auto" }, 
                children: [
                    createElement('div', {className: "assets", style: { position: "relative" }, 
                        children: [
                            activityCheck({activities})?.listening === 1 && activity.type === 2 && activity?.assets?.large_image && activity?.assets?.large_image?.includes('external') ? createElement(TooltipBuilder, { note: activity.assets.large_text || activity?.details, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsLargeImage", 'aria-label': activity.assets.large_text, 'alt': activity.assets.large_text, src: 'https://media.discordapp.net/external' + activity.assets.large_image.substring(activity.assets.large_image.indexOf('/'))})})})
                            : activity?.assets?.large_image && !activity?.assets?.large_image?.includes('external') ? 
                            createElement(TooltipBuilder, { note: activity.assets.large_text || activity?.name, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsLargeImage", src: 'https://cdn.discordapp.com/app-assets/' + activity.application_id + '/' +activity?.assets.large_image + ".png" })})}) :
                            activity?.assets?.large_image?.includes('external') ? createElement(TooltipBuilder, { note: activity.assets.large_text || activity?.name, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsLargeImage", 'aria-label': activity.assets.large_text, 'alt': activity.assets.large_text, src: 'https://media.discordapp.net/external' + activity.assets.large_image.substring(activity.assets.large_image.indexOf('/'))})})}) 
                            : activity?.application_id && !activity?.platform?.includes('xbox') ? createElement('img', { className: "gameIcon", style: {width: "40px", height: "40px"}, src: 'https://cdn.discordapp.com/app-icons/' + activity.application_id + '/' + ApplicationStore.getApplication(activity?.application_id)?.icon + ".png" }) :
                            activity?.platform?.includes('xbox') ? createElement('img', { className: "assetsLargeImageXbox assetsLargeImage",  style: { width: "60px", height: "60px"}, src: 'https://discord.com/assets/d8e257d7526932dcf7f88e8816a49b30.png'}) : createElement('svg', { style: {width: "40px", height: "40px"}, 
                                children: 
                                    createElement('path', { style: {transform: "scale(1.65)"}, d: 'M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', fill: "white"})
                                }),
                            activity?.assets?.large_image && activity?.assets?.small_image && activity?.assets?.small_image?.includes('external') ? createElement(TooltipBuilder, { note: activity.assets.small_text || activity?.details, 
                                children: createElement('div', { className: "assetsSmallImageContainer",
                                    children: createElement('img', {className: "assetsSmallImage", 'aria-label': activity.assets.small_text, 'alt': activity.assets.small_text, src: 'https://media.discordapp.net/external' + activity?.assets?.small_image?.substring(activity.assets.small_image.indexOf('/'))})})})
                            : activity?.assets?.large_image && activity?.assets?.small_image && !activity?.assets?.small_image?.includes('external') ? 
                            createElement(TooltipBuilder, { note: activity.assets.small_text, 
                                children: createElement('div', { className: "assetsSmallImageContainer",
                                    children: createElement('img', {className: "assetsSmallImage", src: 'https://cdn.discordapp.com/app-assets/' + activity.application_id + '/' +activity?.assets.small_image + ".png" })})}) :
                            activity?.assets?.large_image && activity?.assets?.small_image?.includes('external') ? createElement(TooltipBuilder, { note: activity.assets.small_text, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsSmallImage", 'aria-label': activity.assets.small_text, 'alt': activity.assets.small_text, src: 'https://media.discordapp.net/external' + activity?.assets?.small_image?.substring(activity.assets.small_image.indexOf('/'))})})}) 
                            : createElement('path', { style: {transform: "scale(1.65)"}, d: 'M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', fill: "white"})
                            
                ]}),
                activityCheck({activities})?.listening === 1 && activity.type === 2 ? createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                children: [
                    createElement('div', { className: "nameNormal textRow ellipsis", style: { fontWeight: "600"} }, activity.details),
                    createElement('div', { className: "state textRow ellipsis"}, activity.state),
                    activity?.timestamps?.end ? createElement('div', { className: "mediaProgressBarContainer", 
                        children: createElement(MediaProgressBar, {start: activity?.timestamps?.start, end: activity?.timestamps?.end})}) 
                    : createElement(ActivityTimer, {activity: activity})
                ]})
                : createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                children: [
                    createElement('div', { className: "nameNormal textRow ellipsis", style: { fontWeight: "600"} }, activity.name),
                    createElement('div', { className: "details textRow ellipsis" }, activity.details),
                    createElement('div', { className: "state textRow ellipsis"}, activity.state),
                    createElement(ActivityTimer, {activity: activity})
                ]}),
                createElement('div', {className: "buttonsWrapper actionsProfile", style: { display: "flex", flex: "0 1 auto", flexDirection: "column", flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-end", marginLeft: "20px" }, 
                    children: 
                        createElement(ActivityButtons, {user: user, activity: activity})
                })
            ]})
        ]}))
    ]})
}
function SpotifyCards({user, activities}) {
    const _activities = activities.filter(activity => activity && activity.name && activity.name.includes("Spotify"));
    return createElement('div', { className: "activityProfileContainer activityProfileContainerSpotify",
    children: 
        _activities.map(activity => createElement('div', {className: "activityProfile activity", 
        children: [
            createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, headers[activity.type] + activity?.name),
            createElement('div', {className: "bodyNormal", style: { display: "flex", alignItems: "center", width: "auto" }, 
                children: [
                    createElement('div', {className: "assets", style: { position: "relative" }, 
                        children: [
                            activity?.assets?.large_image ? createElement(TooltipBuilder, { note: activity.assets.large_text || activity?.details, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsLargeImage", style: {width: '90px', height: '90px', borderRadius: "8px"}, 'aria-label': activity.assets.large_text, 'alt': activity.assets.large_text, src: 'https://i.scdn.co/image/' + activity.assets.large_image.substring(activity.assets.large_image.indexOf(':')+1)})})})
                                    : createElement('svg', { style: {width: "40px", height: "40px"}, 
                                children: 
                                    createElement('path', { style: {transform: "scale(1.65)"}, d: 'M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', fill: "white"})
                                })
                ]}),
                createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                children: [
                    createElement('div', { className: "nameNormal textRow ellipsis", style: { fontWeight: "600"} }, activity.details),
                    createElement('div', { className: "state textRow ellipsis"}, activity.state),
                    activity?.timestamps?.end ? createElement('div', { className: "mediaProgressBarContainer", 
                        children: createElement(MediaProgressBar, {start: activity?.timestamps?.start, end: activity?.timestamps?.end})}) 
                    : createElement(ActivityTimer, {activity: activity})
                ]}),
                createElement('div', {className: "buttonsWrapper actionsProfile", style: { display: "flex", flex: "0 1 auto", flexDirection: "row", flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-end", gap: "6px" }, 
                    children: 
                        createElement(SpotifyButtons, {user: user, activity: activity})
                })
            ]})
        ]}))
    })
}
function TwitchCards({user, activities}) {
    const _activities = activities.filter(activity => activity && activity.name && activity.type === 1);
    const __activities = [_activities[0]];
    return createElement('div', { className: "activityProfileContainer activityProfileContainerTwitch", 
    children: 
        __activities.map(activity => createElement('div', {className: "activityProfile activity", 
        children: [
            createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, intl.intl.formatToPlainString(intl.t['Dzgz4u'], { platform: activity?.name })),
            createElement('div', {className: "bodyNormal", style: { display: "flex", alignItems: "center", width: "auto" }, 
                children: [
                    createElement('div', {className: "assets", style: { position: "relative" }, 
                        children: [
                            activity?.assets?.large_image ? createElement(TooltipBuilder, { note: activity.assets.large_text || activity?.details, 
                                children: createElement('div', { 
                                    children: createElement('img', {className: "assetsLargeImageTwitch assetsLargeImage", style: {width: '160px', height: '90px', borderRadius: "8px", objectFit: "cover" }, 'aria-label': activity.assets.large_text, 'alt': activity.assets.large_text, src: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_' + activity.assets.large_image.substring(activity.assets.large_image.indexOf(':')+1) + '-162x90.jpg'})})})
                                    : createElement('svg', { style: {width: "40px", height: "40px"}, 
                                children: 
                                    createElement('path', { style: {transform: "scale(1.65)"}, d: 'M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm6.81 7c-.54 0-1 .26-1.23.61A1 1 0 0 1 8.92 8.5 3.49 3.49 0 0 1 11.82 7c1.81 0 3.43 1.38 3.43 3.25 0 1.45-.98 2.61-2.27 3.06a1 1 0 0 1-1.96.37l-.19-1a1 1 0 0 1 .98-1.18c.87 0 1.44-.63 1.44-1.25S12.68 9 11.81 9ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm7-10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM18.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM5.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', fill: "white"})
                                })
                ]}),
                createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                children: [
                    createElement('h3', { className: "nameWrap nameNormal textRow", style: { fontWeight: "600"} }, activity.details),
                    createElement('div', { className: "state textRow ellipsis"}, intl.intl.formatToPlainString(intl.t['BMTj29']) + " " + activity.state)
                ]}),
                createElement('div', {className: "buttonsWrapper actionsProfile", style: { display: "flex", flex: "0 1 auto", flexDirection: "row", flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-end", gap: "6px" }, 
                    children: 
                        createElement(ActivityButtons, {user: user, activity: activity})
                })
            ]})
        ]}))
    })
}
function VoiceCards({user, voice, stream}) {
    const channel = useStateFromStores([ ChannelStore ], () => ChannelStore.getChannel(voice));
    //console.log(ChannelStore.getChannel(voice));

    if (stream || !channel) return;
    return createElement('div', {className: "activityProfile activity", 
        children: 
        createElement('div', { className: "activityProfileContainerVoice", 
            children: [
                createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, intl.intl.formatToPlainString(intl.t['grGyaW'])),
                createElement('div', {className: "bodyNormal", style: { display: "flex", alignItems: "center", width: "auto" },
                    children: [
                        createElement(VoiceBox, { users: userVoice({voice}), channel: channel, themeType: "MODAL"}),
                        createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                            children: [
                                createElement('h3', { className: "textRow", style: { display: "flex", alignItems: "center" }, 
                                    children: [
                                        VoiceIcon({channel: channel}),
                                        createElement('h3', { className: "nameWrap nameNormal textRow", style: { fontWeight: "600" }}, (channel.name || RelationshipStore.getNickname(user.id)))
                                    ]
                                }),
                                GuildStore.getGuild(channel.guild_id)?.name && createElement('div', { className: "state textRow ellipsis"}, intl.intl.formatToPlainString(intl.t['Xe4de3'], { channelName: GuildStore.getGuild(channel.guild_id)?.name}))
                            ]}),
                            createElement('div', {className: "buttonsWrapper actionsProfile", style: { display: "flex", flex: "0 1 auto", flexDirection: "row", flexWrap: "nowrap", justifyContent: "flex-start", alignItems: "flex-end", gap: "6px", position: "relative" }, 
                                children: 
                                    createElement(CallButtons, { channel: channel })
                        })
                    ]
                })
            ]
        })
    })
}
function StreamCards({user, voice}) {
    const streams = useStateFromStores([ StreamStore ], () => StreamStore.getAllApplicationStreamsForChannel(voice));
    const _streams = streams.filter(streams => streams && streams.ownerId == user.id)
    const channel = useStateFromStores([ ChannelStore ], () => ChannelStore.getChannel(voice));
    //console.log(streams);
    //console.log(channel);


    return _streams.map(stream => createElement('div', {className: "activityProfile activity", 
        children: 
        createElement('div', { className: "activityProfileContainerStream", style: { overflow: "hidden auto" }, 
            children: [
                createElement('h3', {className: "headerTextNormal headerText", style: { color: "var(--white)", marginBottom: "8px"}}, intl.intl.formatToPlainString(intl.t['sddlGB'], { server: GuildStore.getGuild(channel.guild_id)?.name || channel.name })),
                createElement('div', {className: "bodyNormal", style: { display: "flex", alignItems: "center", width: "auto" },
                    children: [
                        ApplicationStreamPreviewStore.getPreviewURLForStreamKey(stream?.streamType + ":" + stream?.guildId + ":" + stream?.channelId + ":" + stream?.ownerId) ? createElement('img', {src: ApplicationStreamPreviewStore.getPreviewURLForStreamKey(stream?.streamType + ":" + stream?.guildId + ":" + stream?.channelId + ":" + stream?.ownerId), className: "streamPreviewImage", style: { maxHeight: "60px", borderRadius: "8px" }}) 
                        : createElement('img', { style: { width: "120px", height: "120px" }, src: 'https://discord.com/assets/6b1a461f35c05c7a.svg' }),
                        createElement('div', {className: "contentImagesProfile content", style: { display: "grid", flex: "1", marginBottom: "3px" },
                            children: [
                                createElement('h3', { className: "textRow", style: { display: "flex", alignItems: "center" }, 
                                    children: [
                                        VoiceIcon({channel: channel}),
                                        createElement('h3', { className: "nameWrap nameNormal textRow", style: { fontWeight: "600" }}, channel.name)
                                    ]
                                }),
                                createElement(VoiceList, { className: "userList", users: userVoice({voice}), maxUsers: userVoice({voice}).length, guildId: stream.guildId, channelId: stream.channelId})
                            ]}),
                            createElement('div', {className: "buttonsWrapper actionsProfile", style: { display: "flex", flex: "0 1 auto", flexDirection: "row", flexWrap: "nowrap", justifyContent: "flex-end", alignItems: "flex-end", gap: "6px", position: "relative" }, 
                                children: 
                                    createElement(CallButtons, { channel: channel })
                        })
                    ]
                })
            ]
        })
    }))
}

function TabBarBuilder({user, currentUser, tab, setTab, ref}) {
    return createElement('div', {className: "tabBarContainer", style: { borderTopColor: "var(--background-secondary", borderTop: "1px solid hsla(0, 0%, 100%, .1)", paddingLeft: "20px"}, 
            children:
                createElement('div', {className: "tabBar", style: { display: "flex", alignItems: "stretch", height: "55px", flexDirection: "row"}, 
                children: [
                    createElement('div', {className: "tabBarItem", tabIndex: 0, "aria-selected": tab === tabs.ABOUT, "aria-controls": "about-tab", 
                        onClick: () => {
                             setTab(tabs.ABOUT);
                            ref.current?.scrollTo(0, 0);
                        },
                    },
                    intl.intl.formatToPlainString(intl.t['E466pK']).substring(0,1).toUpperCase() + intl.intl.formatToPlainString(intl.t['E466pK']).substring(1) + " " + intl.intl.formatToPlainString(intl.t['HY+vdH'])
                    ),
                    (user.id != currentUser.id) && createElement('div', {className: "tabBarItem", tabIndex: 1, "aria-selected": tab === tabs.SERVERS, "aria-controls": "servers-tab", 
                        onClick: () => {
                            setTab(tabs.SERVERS);
                            ref.current?.scrollTo(0, 0);
                        },
                    },
                    intl.intl.formatToPlainString(intl.t['sySsXV'])
                    ),
                    (user.id != currentUser.id) && createElement('div', {className: "tabBarItem", tabIndex: 2, "aria-selected": tab === tabs.FRIENDS, "aria-controls": "friends-tab", 
                        onClick: () => {
                            setTab(tabs.FRIENDS);
                            ref.current?.scrollTo(0, 0);
                        },
                    },
                    intl.intl.formatToPlainString(intl.t['afBKs7'])
                    )
                ] 
            })
        })
}
function HeaderInnerBuilder({user, currentUser, displayProfile, tagName, displayName}) {
    return createElement('header', {className: "header", 
            children: [
                createElement(avatarFetch, {className: "avatar", user: user}),
                createElement('div', {className: "headerInfo",
                    children:
                    [
                    createElement('div', {className: "nameSection", 
                    children: [
                        createElement('div', {className: "displayName"}, displayName || tagName),
                        !Data.load('ProfileRestructure', 'disableDiscrim') && displayProfile._userProfile?.legacyUsername ? createElement('div', {className: "nameTag", style: { marginLeft: "-5px" }}, displayProfile._userProfile?.legacyUsername?.substring(displayProfile._userProfile?.legacyUsername?.indexOf("#")))
                        : createElement('div', {className: "nameTag"},  "@" + tagName)
                    ]}),
                    createElement(badgeComponent, {badges: displayProfile._userProfile.badges})
                    ]
                }),
                createElement('div', {className: "profileButtons", 
                    children: 
                        createElement(buttonComponent, {user: user, currentUser: currentUser, relationshipType: RelationshipStore.getRelationshipType(user.id)})})
                ]
            })
}

function headerBuilder({props, user, currentUser, displayProfile, tab, setTab, ref}) {
    const tagName = user.username;
    const displayName = user.globalName;
    const activities = useStateFromStores([ ActivityStore ], () => ActivityStore.getActivities(user.id));
    const voice = useStateFromStores([ Webpack.getStore('VoiceStateStore') ], () => Webpack.getStore('VoiceStateStore').getVoiceStateForUser(user.id)?.channelId);
    const stream = useStateFromStores([ StreamStore ], () => StreamStore.getAnyStreamForUser(user.id));
    console.log(activities);

    if (activities.length !== 0 && (activityCheck({activities}).playing === 1 || activityCheck({activities}).listening === 1 || activityCheck({activities}).watching === 1) && (activityCheck({activities}).spotify === 0 && activityCheck({activities}).streaming === 0 && activityCheck({activities}).xbox === 0) || voice !== undefined) {
        return createElement('div', {className: "topSectionPlaying", style: { backgroundColor: "var(--background-brand)" }, 
            children: [
                displayProfile.banner && createElement('img', {className: "userBanner", src: displayProfile.getBannerURL({canAnimate: true}), style: {width: "600px", height: "200px"}, alt: ""}),
                createElement(HeaderInnerBuilder, {user, currentUser, displayProfile, tagName, displayName}),
                createElement(ClanTagBuilder, {user}),
            createElement('div', {className: "headerFill", 
                children: [
                    createElement(CustomCards, {className: "activity", activities}),
                    createElement('div', { className: "activityCardsContainer", style: { overflow: "hidden auto", display: "flex", flexDirection: "column" }, 
                    children:
                        createElement(ActivityCards, {user, activities, voice, stream}),
                    }),
                    createElement(TabBarBuilder, {user, currentUser, tab, setTab, ref})
                ]
            })
        ]})
    }
    else if (activities.length !== 0 && activityCheck({activities}).spotify === 1 || voice !== undefined) {
        return createElement('div', {className: "topSectionSpotify", style: { background: "#1db954" }, 
            children: [
                createElement(HeaderInnerBuilder, {user, currentUser, displayProfile, tagName, displayName}),
                createElement(ClanTagBuilder, {user}),
            createElement('div', {className: "headerFill", 
                children: [
                    createElement(CustomCards, {className: "activity", activities}),
                    createElement('div', { className: "activityCardsContainer", style: { overflow: "hidden auto", display: "flex", flexDirection: "column" }, 
                    children: [
                        createElement(SpotifyCards, {user, activities}),
                        createElement(ActivityCards, {user, activities}),
                    ]}),
                    createElement(TabBarBuilder, {user, currentUser, tab, setTab, ref})
                ]
            })
        ]})
    }
    else if (activities.length !== 0 && activityCheck({activities}).streaming === 1 || voice !== undefined) {
        return createElement('div', {className: "topSectionStreaming", style: { background: "#593695" }, 
            children: [
                createElement(HeaderInnerBuilder, {user, currentUser, displayProfile, tagName, displayName}),
                createElement(ClanTagBuilder, {user}),
            createElement('div', {className: "headerFill",
                children: [
                    createElement(CustomCards, {className: "activity", activities}),
                    createElement('div', { className: "activityCardsContainer", style: { overflow: "hidden auto", display: "flex", flexDirection: "column" }, 
                    children: [
                        createElement(TwitchCards, {user, activities}),
                        createElement(ActivityCards, {user, activities}),
                    ]}),
                    createElement(TabBarBuilder, {user, currentUser, tab, setTab, ref})
                ]
            })
        ]})
    }
    else if (activities.length !== 0 && activityCheck({activities}).xbox === 1 || voice !== undefined) {
        return createElement('div', {className: "topSectionXbox", style: { background: "#107c10" }, 
            children: [
                createElement(HeaderInnerBuilder, {user, currentUser, displayProfile, tagName, displayName}),
                createElement(ClanTagBuilder, {user}),
            createElement('div', {className: "headerFill",
                children: [
                    createElement(CustomCards, {className: "activity", activities}),
                    createElement('div', { className: "activityCardsContainer", style: { overflow: "hidden auto", display: "flex", flexDirection: "column" }, 
                    children:
                        createElement(ActivityCards, {user, activities}),
                    }),
                    createElement(TabBarBuilder, {user, currentUser, tab, setTab, ref})
                ]
            })
        ]})
    }
    return createElement('div', {className: "topSectionNormal", style: { backgroundColor: "var(--background-tertiary)" }, 
        children: [
            displayProfile.banner && createElement('img', {className: "userBanner", src: displayProfile.getBannerURL({canAnimate: true}), style: {width: "600px", height: "200px"}, alt: ""}),
            createElement(HeaderInnerBuilder, {user, currentUser, displayProfile, tagName, displayName}),
            createElement(ClanTagBuilder, {user}),
            createElement(CustomCards, {className: "activity", activities}),
            createElement(TabBarBuilder, {user, currentUser, tab, setTab, ref})
    ]})
}

function AboutTab({props, data, user, displayProfile}) {
    const connections = displayProfile._userProfile.connectedAccounts;
    return createElement('div', {className: "infoScroller", style: { overflow: "hidden scroll", paddingRight: "12px"}, 
    children: [
        displayProfile?.pronouns && createElement('div', {className: "userInfoSection",
            children: [
                createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['+T3RIy'])),
                createElement('div', {className: "userPronouns", style: { color: "var(--text-default)", fontSize: "14px"}}, displayProfile.pronouns)
        ]}),
        createElement('div', {className: "userInfoSection", 
            children: 
                BioBuilder({displayProfile})
        }),
        createElement('div', {className: "userInfoSection", 
            children: [
                RoleBuilder({user, data, displayProfile})
        ]}),
        createElement('div', {className: "userInfoSection", 
            children: [
                createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['a6XYDw'])),
                createElement('div', {className: "memberSinceWrapper", style: { display: "flex", gap: "8px", alignItems: "center" }, children: MemberDateBuilder({data, user})
            })
        ]}),
        createElement('div', {className: "userInfoSection", 
            children: [
                createElement('div', {className: "userInfoSectionHeader"}, intl.intl.formatToPlainString(intl.t['mQKv+v']).substring(0, 5)),
                createElement(noteComponent, {userId: user.id})
        ]}),
        createElement('div', {className: "userInfoSection", style: { borderTop: "1px solid var(--background-modifier-accent)" },
            children: [
                createElement(ConnectionCards, {user, connections}),
        ]})

    ]})
}

function FriendsTab({data, user}) {
    const mutualFriends = UserProfileStore.getMutualFriends(user.id)
    if (!mutualFriends?.length == 0) {
        return createElement('div', {className: "listScroller", style: { overflow: "hidden scroll", paddingRight: "0px"}, 
        children:
            mutualFriends.map(mutual => createElement(MutualFriendRenderer, { className: "listRow", user: mutual.user, status: mutual.status, guildId: mutual.displayProfile?.guildId, onSelect: () => { ModalAccessUtils.openUserProfileModal({ userId: mutual.user.id }); data.onClose() } }))
        })
    }
    return createElement('div', {className: "listScroller", style: { overflow: "hidden scroll", paddingRight: "0px"}, 
        children:
            createElement('div', {className: "empty", 
                children: [
                    createElement('div', {className: "emptyIconFriends emptyIcon"}),
                    createElement('div', {className: "emptyText"}, intl.intl.formatToPlainString(intl.t['/5p4g4']))
                ]
        })
    })
}

function ServersTab({data, user}) {
    const mutualServers = UserProfileStore.getMutualGuilds(user.id);
    if (!mutualServers?.length == 0) {
        return createElement('div', {className: "listScroller", style: { overflow: "hidden scroll", paddingRight: "0px"}, 
        children:
            mutualServers.map(mutual => createElement(MutualServerRenderer, { key: mutual.guild.id, className: "listRow", user: user, guild: mutual.guild, nick: mutual?.nick, onSelect: () => { NavigationUtils.transitionToGuild(mutual.guild.id); data.onClose() } }))
        })
    }
    return createElement('div', {className: "listScroller", style: { overflow: "hidden scroll", paddingRight: "0px"}, 
        children:
            createElement('div', {className: "empty", 
                children: [
                    createElement('div', {className: "emptyIconGuilds emptyIcon"}),
                    createElement('div', {className: "emptyText"}, intl.intl.formatToPlainString(intl.t['zjVh8v']))
                ]
        })
    })

}

function bodyBuilder({props, data, user, displayProfile, tab, setTab, ref}) {
    return createElement('div', {className: "body", style: {height: "274px", backgroundColor: "var(--background-secondary)"}, ref: ref}, 
        tab === tabs.ABOUT
            ? createElement(AboutTab, { props, data, user, displayProfile })
                : tab === tabs.SERVERS
                   ? createElement(ServersTab, { data, user }) 
                        : tab === tabs.FRIENDS
                            ? createElement(FriendsTab, { data, user }) : createElement(FallbackTab, {})
    )
}

const styles = Object.assign({},
    Webpack.getByKeys('outer', 'overlay'),
    Webpack.getByKeys('container', 'bar', 'progress'),
    Webpack.getByKeys('container', 'badge'), 
    Webpack.getByKeys('colorPrimary', 'grow'),
    Webpack.getByKeys('themeColor', 'secondary'),
    Webpack.getByKeys('lineClamp2Plus'),
    Webpack.getByKeys('background', 'content', 'textContainer'),
    Webpack.getByKeys('badgeContainer', 'badgesContainer'),
    Webpack.getByKeys('tabularNumbers')
);

const profileCSS = webpackify(
    `
    body {
        --background-brand: var(--bg-brand);
        .custom-user-profile-theme {
            --button-filled-brand-background: var(--profile-gradient-button-color);
            --button-filled-brand-background-hover: color-mix(in srgb, var(--profile-gradient-button-color) 80%, transparent);
            --button-filled-brand-background-active: color-mix(in srgb, var(--profile-gradient-button-color) 70%, transparent);
        }
    }

    .outer.user-profile-modal-v2 {
        height: fit-content;
        min-height: 450px;
        max-height: 700px;
        max-width: 600px;
        min-width: 600px;
        border-radius: 0;
        background: rgba(0, 0, 0, 0.7); !important;
        --profile-gradient-start: color-mix(in oklab, var(--profile-gradient-primary-color) 100%, var(--profile-gradient-primary-color));
        --profile-gradient-end: color-mix(in oklab, var(--profile-gradient-secondary-color) 100%, var(--profile-gradient-secondary-color));
        --custom-user-profile-theme-color-blend: linear-gradient(color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-start)), color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-end)));
    }
    .inner {
        margin: unset !important;
        flex-direction: column !important;
        gap: unset !important;
        padding: unset !important;
        background-image: var(--theme-base-color) !important;
    }
    .custom-theme-background .theme-dark, .theme-dark.custom-theme-background {
        --theme-base-color: var(--custom-user-profile-theme-color-blend, var(--theme-base-color-dark)) !important;
    }
    .custom-theme-background .theme-light, .theme-light.custom-theme-background {
        --theme-base-color: var(--custom-user-profile-theme-color-blend, var(--theme-base-color-light)) !important;
    }
    
    /*
    .topSectionNormal:has(.userBanner) {
        background-image: linear-gradient(color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-primary-color)) 60%, color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-secondary-color) 50%));
        mask-image: linear-gradient(to bottom, var(--profile-gradient-overlay-color), var(--profile-gradient-overlay-color);
        .tabBarContainer {
            z-index: 2;
            position: relative;
        }
    }
    .inner:has(.userBanner) .body {
        background-image: linear-gradient(color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-secondary-color)) 10%, color-mix(in oklab, var(--profile-gradient-overlay-color), var(--profile-gradient-primary-color) 0%)); 
        mask-image: linear-gradient(to bottom, var(--profile-gradient-overlay-color), var(--profile-gradient-overlay-color);
    }
    */
    .userBanner {
        position: absolute;
        z-index: 0;
        opacity: 25%;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
        pointer-events: none;
    }
    
    .header {
        display: flex;
        align-items: center;
        padding: 20px; 
        flex-direction: row;
    }
    .avatar {
        position: unset !important;
        margin-right: 20px;
        width: unset !important;
    }
    .clanTagContainer {
        width: 80px;
        max-width: 80px;
        overflow: hidden;
        margin-top: -10px;
        display: flex;
        justify-content: center;
        padding: 0 0 10px 20px;
    }
    .clanTag {
        align-items: center;
        background: rgba(0,0,0,0.2);
        border-radius: 4px;
        display: inline-flex;
        line-height: 16px !important;
        padding: 0 4px;
        transition: background .1s ease-in-out;
        vertical-align: middle;
        height: 20px;
    }
    .clanTagInner {
        align-items: center;
        display: inline-flex;
        line-height: 16px !important;
        max-width: 60px;
    }
    .tagBadge {
        margin-right: 2px;
        margin-top: 0;
        width: 14px;
        height: 14px;
    }
    .headerInfo {
        flex: 1;
        min-width: 0; 
        padding-right: 16px;
        position: relative;
    }
    .nameSection {
        display: flex; 
        white-space: normal; 
        word-break: break-word; 
        line-height: 20px; 
        flex-wrap: wrap; 
        margin-right: 20px;
        align-items: baseline;
    }
    .displayName {
        color: var(--header-primary);
        font-weight: 600;
        font-size: 18px;
        margin-right: 5px;
    }
    .nameTag {
        color: var(--header-secondary);
        font-weight: 500;
        font-size: 14px;
    }
    .profileBadges {
        .container {
            position: unset;
            flex: 0 1 auto;
            transform: unset;
            transform-origin: unset;
            margin-right: 3px;
            .badge {
                height: 28px;
                width: 28px;
            }
        }
    }
    .profileButtons {
        display: flex;
        gap: 8px;
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
            background: var(--green, var(--button-filled-brand-background));
            svg {
                display: none;
            } 
        }
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)):hover {
            background: var(--green-hover, var(--button-filled-brand-background-hover)) !important;
        }
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)):active {
            background: var(--green-active, var(--button-filled-brand-background-active)) !important;
        }
        .themeColor.secondary {
            background: unset !important;
            border: unset !important;
            color: #7c7e81;
            svg {
                stroke: #7c7e81;
            }
        }
        .themeColor.secondary:hover {
            color: var(--interactive-hover);
            svg {
                stroke: var(--interactive-hover);
            }
        }
        .themeColor.secondary:active {
            color: var(--interactive-active);
            svg {
                stroke: var(--interactive-active);
            }
        }
    }
    .topSectionPlaying .profileButtons {
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
            color: var(--background-brand);
        }
    }
    .topSectionSpotify .profileButtons {
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
            color: #43b581
        }
    }
    .topSectionStreaming .profileButtons {
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
            color: #593695
        }
    }
    .topSectionXbox .profileButtons {
        .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
            color: #107c10
        }
    }
    .headerFill {
        background-color: rgba(0,0,0,.05);
        display: flex; 
        flex-direction: column;
    }
    .tabBarItem {
        display: flex;
        align-items: center;
        margin-right: 40px;
        font-size: 14px;
        color: var(--interactive-normal);
        border-bottom: 3px solid transparent;
        cursor: pointer;
    }
    .tabBarItem:hover {
        color: var(--interactive-hover);
        border-bottom: 3px solid transparent;
        border-bottom-color: var(--interactive-active);
    }
    .tabBarItem[aria-selected=true] {
        color: var(--interactive-active);
        border-bottom: 3px solid transparent;
        border-bottom-color: var(--interactive-active);
    }
    .infoScroller {
        padding: 0 20px;
        height: 100%;
        &::-webkit-scrollbar {
            background: none;
            border-radius: 8px;
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-clip: padding-box;
            border: solid 2px #0000;
            border-radius: 8px;
        }
        &:hover::-webkit-scrollbar-thumb {
            background-color: var(--bg-overlay-6, var(--background-tertiary));
        }
    }
    .listScroller {
        padding: 8px 0;
        height: 95%;
        &::-webkit-scrollbar {
            background: none;
            border-radius: 8px;
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-clip: padding-box;
            border: solid 2px #0000;
            border-radius: 8px;
        }
        &:hover::-webkit-scrollbar-thumb {
            background-color: var(--bg-overlay-6, var(--background-tertiary));
        }
    }
    .userInfoSection {
        padding: 20px 0 10px 0;
    }
    .userInfoSection:empty {
        display: none;
    }
    .userInfoSectionHeader {
        font-weight: 700;
        font-size: 12px;
        color: var(--channels-default);
        margin-bottom: 10px;
        text-transform: uppercase;
    }
    .divider {
        background-color: var(--interactive-normal);
        border-radius: 50%;
        height: 4px;
        width: 4px;
    }
    .userBio .lineClamp2Plus {
        -webkit-line-clamp: unset !important;
    }
    .activity {
        padding: 20px;
        border-radius: var(--radius-sm);
    }
    .activityHeader {
        font-family: var(--font-display);
        font-size: 12px;
        line-height: 1.2857142857142858;
        font-weight: 600;
        color: var(--header-secondary);
        margin-bottom: 8px;
        text-transform: uppercase;
    }
    .customStatusContent {
        user-select: text;
        white-space: pre-wrap;
        .emoji {
            margin-right: 8px;
            height: 20px;
            width: 20px;
        }
        .emoji+.customStatusText {
            display: inline;
        }
        &:has(.customStatusText:empty) .emoji {
            height: 48px;
            width: 48px;
        }
    }
    .customStatusText {
        color: var(--header-secondary);
        font-weight: 500;
        font-size: 14px;
    }
    .note {
        margin: -4px;
    }
    .note textarea {
        border-radius: 3px;
        border: unset !important;
        background-color: unset !important;
        font-size: 14px;
        line-height: 16px;
        padding: 4px;
    }
    .note textarea:focus {
        background-color: var(--background-tertiary) !important;
    }
    .connectedAccounts {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        flex-direction: row;
        margin-top: -20px;
        list-style-type: none;
    }
    .connectedAccount {
        border-radius: 3px;
        margin-top: 20px;
        padding: 8px 14px 8px 8px;
        width: 240px;
        border: 1px solid;
        border-color: var(--background-modifier-accent);
        flex: 0 1 auto !important
    }
    .connectedAccount div:nth-of-type(2) {
        display: none;
    }
    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        flex: 1;
        min-height: 100%;
        padding: 20px 0;
    }
    .emptyIcon {
        width: 240px;
        height: 130px;
        background-position: 50%;
        background-repeat: no-repeat;
        background-size: cover;
    }
    .emptyText {
        font-weight: 500;
        font-size: 14px;
        line-height: 16px;
        margin-top: 12px;
        text-transform: uppercase;
        color: var(--header-secondary);
    }
    :is(.theme-dark) .emptyIconFriends {
        background-image: url(https://discord.com/assets/ca3f5ec71bb86c6aeb015bb0d54a10fa.svg);
    }
    :is(.theme-dark) .emptyIconGuilds {
        background-image: url(https://discord.com/assets/1fc96c69951bfa5c.svg);
    }
    :is(.theme-light) .emptyIconFriends {
        background-image: url(https://discord.com/assets/898a7791572e9e050735eeec7e25739d.svg);
    }
    :is(.theme-light) .emptyIconGuilds {
        background-image: url(https://discord.com/assets/38af48da1542dfedce582fc5e8042285.svg);
    }
    .activityCardsContainer {
        flex: 1 0 fit-content;
        scroll-snap-type: y mandatory;
        max-height: 240px;
        & .overlay {
                scroll-snap-align: start;
                scroll-margin-top: 15px;
            }
	    &::-webkit-scrollbar {
            background: none;
            border-radius: 8px;
            width: 8px;
        }
        &::-webkit-scrollbar-thumb {
            background-clip: padding-box;
            border: solid 2px #0000;
            border-radius: 8px;
        }
        &:hover::-webkit-scrollbar-thumb {
            background-color: var(--white));
        }
    }
    .activityProfileContainerVoice .bodyNormal > div:nth-child(1) {
        height: 60px;
        width: 60px;
        background: rgb(var(--bg-overlay-color-inverse) / 0.15) !important;
    }
    :is(.activityProfileContainerVoice, .activityProfileContainerStream) .textRow svg {
        width: 12px;
        height: 12px;
        margin-right: 2px;
        position: relative;
        bottom: 1px;
        path {
            fill: #fff;
        }
    }
    .activityProfile .headerText {
        font-family: var(--font-display);
        font-size: 12px;
        line-height: 1.2857142857142858;
        font-weight: 700;
        text-transform: uppercase;
    }
    .activityProfile .contentImagesProfile {
        margin-left: 20px;
    }
    .activityProfile .contentImagesProfile .mediaProgressBarContainer {
        margin-top: 10px;
        width: auto;
        margin-right: 8px;
        .bar {
            background-color: rgba(79,84,92,.16);
        }
        [data-text-variant="text-xs\/normal"] {
            color: var(--white) !important;
        } 
        
    }
    .activityProfile :is(.nameNormal, .details, .state, .timestamp) {
        color: #fff;
    }
    .activityProfile .textRow {
        display: block;
        font-size: 14px;
        line-height: 18px;
    }
    .activityProfile .ellipsis {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .activityProfile .state {
        white-space: wrap;
    }
    .activityProfile .actionsProfile button {
        background: transparent !important;
        border: 1px solid var(--white) !important;
        margin-bottom: 8px;
        height: 32px;
        min-height: 32px !important;
        color: #fff;
        svg {
            display: none;
        }
    }
    .activityProfile .actionsProfile button:active {
        background-color: hsla(0,0%,100%,.1) !important;
    }
    .activityProfile .actionsProfile button svg {
        display: unset;
    }
    .activityProfile .badgeContainer .tabularNumbers {
        color: #f6fbf9 !important;
    }
    .activityProfile .badgeContainer svg path {
        fill: #f6fbf9 !important;
    }
    .activityProfile .assets .assetsLargeImage {
        width: 90px;
        height: 90px;
        border-radius: 8px; 
        object-fit: cover;
    }
    .activityProfile .assets:has(.assetsSmallImage) .assetsLargeImage {
        mask: url('https://discord.com/assets/725244a8d98fc7f9f2c4a3b3257176e6.svg');
    }
    .activityProfile .assets .assetsSmallImageContainer {
        position: absolute;
        bottom: -3px;
        right: -4px;
    }
    .activityProfile .assets .assetsSmallImage {
        width: 30px;
        height: 30px;
        border-radius: 50%; 
    }
    :is(.topSectionPlaying, .topSectionSpotify, .topSectionStreaming, .topSectionXbox) {
        .userBanner {
            opacity: 50%;
        }
        .avatar rect {
            fill: #fff;
        }
        .nameTag {
            color: #fff; 
            font-weight: 600; 
            opacity: 0.6;
        }
        .profileButtons {
            .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)) {
                background: #fff;     
            }
            .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)):hover {
                background: #f8f9fd !important;
            }
            .lookFilled:is(.colorBrand, .colorPrimary:is(.grow)):active {
                background: #e3e7f8 !important;
            }
            .themeColor_fb7f94.secondary_fb7f94 {
                color: var(--white);
                svg {
                    stroke: var(--white) !important;
                }
            }
        }
        .tabBarItem {
            color: rgba(255, 255, 255, 0.4);
        }
        .tabBarItem:hover {
            color: rgba(255, 255, 255, 0.6);
        }
        .tabBarItem[aria-selected=true] {
            color: var(--interactive-active);
        }
        .activityHeader {
            color: var(--white);
        }
        .customStatusText {
            color: var(--white);
            font-weight: 550;
        }
    }

    .theme-light :is(.topSectionPlaying, .topSectionSpotify, .topSectionStreaming, .topSectionXbox) {
        .displayName {
            color: #fff;
        }
        .tabBarItem:hover {
            border-bottom-color: transparent;
        }
        .tabBarItem[aria-selected=true] {
            color: #fff;
            border-bottom-color: #fff;
        }
    }
    
    .background {
        background: url('https://raw.githubusercontent.com/KingGamingYT/kinggamingyt.github.io/refs/heads/main/Assets/DiscordProfileModalSkeleton_2020_Darker.svg');
        background-size: cover;
    }
    .background:before {
        left: 0;
    }
    .background:after {
        display: none;
    }
    .inner > .content {
        width: unset;
        padding-top: 60px;
    }

    /* badges */

    :is(.topSectionPlaying, .topSectionSpotify, .topSectionStreaming, .topSectionXbox) .profileBadges {
        /* Staff */
        [src="https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c65515d1f7e60d.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cg clip-path='url(%23a)'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M24 12c0-6.628-5.372-12-12-12C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12ZM7.266 5.908c-.08.128-.273.417-.273.417l-.006.006 3.782 3.878-1.484 1.483-3.825-3.81h-.001l-.06.06-.038.04c-.113.103-.297.242-.412.18-.251-.137-.592-.416-.496-.672.096-.256.8-1.534 2.206-2.158 0 0 .176-.048.288.048.112.096.4.4.32.528Zm8.966 4.245-.202.192.054.33-.33-.052-.1.099.019.019a.083.083 0 0 1 0 .117.085.085 0 0 1-.059.024.085.085 0 0 1-.058-.024l-.018-.02-.048.048.024.023a.082.082 0 1 1-.116.117l-.024-.023-.89.891.017.017a.083.083 0 0 1 0 .117.082.082 0 0 1-.116 0l-.017-.016-.047.046.022.022a.083.083 0 0 1-.117.117l-.022-.022-.134.135-.15.017-.092-.096.002.004-4.76 4.761-.096.096-.001.001.053.053-.036.214-.1.098.033.032a.083.083 0 0 1-.059.14.082.082 0 0 1-.058-.023l-.033-.033-.047.047.038.038a.084.084 0 0 1 0 .117.082.082 0 0 1-.058.024.08.08 0 0 1-.059-.024l-.039-.04-.89.879.04.04a.082.082 0 0 1 0 .117.081.081 0 0 1-.117 0l-.04-.04-.049.046.047.046a.083.083 0 0 1-.059.141.082.082 0 0 1-.057-.024l-.048-.047-.102.1.055.334-.337-.055-.121.119-.49-.086-.04-.017c-.118-.046-.46-.181-.696-.42-.294-.296-.436-.742-.436-.742l-.093-.511.107-.11-.025-.38.34.062.065-.067-.015-.016a.083.083 0 0 1 .057-.14c.022 0 .043.007.06.023l.014.014.046-.047-.02-.019a.083.083 0 0 1 .118-.117l.018.018.877-.891-.006-.006a.083.083 0 0 1 0-.117.081.081 0 0 1 .117 0l.005.005.046-.048-.009-.01a.082.082 0 0 1 0-.115.081.081 0 0 1 .117 0l.008.007.112-.114.199-.028.062.051 4.792-4.79.074-.076h.001l-.06-.063.015-.148.116-.117-.016-.016a.083.083 0 0 1 .06-.141.08.08 0 0 1 .057.025l.016.015.047-.047-.021-.02a.083.083 0 0 1 0-.118.085.085 0 0 1 .058-.024.09.09 0 0 1 .059.024l.02.02.888-.892-.013-.013a.082.082 0 0 1 .059-.141c.02 0 .042.009.058.024l.012.013.047-.047-.017-.017a.083.083 0 0 1 .117-.117l.017.017.097-.098-.051-.334.337.046.18-.18-.421-.419-2.11-3.9s-.086-.204.058-.305a.29.29 0 0 1 .172-.063c.072 0 .147.031.25.079.18.085 3.574 1.929 3.574 1.929l.585.572.106-.107-.022-.022-.035-.305.357.054.048-.064.474.085s.906.751 1.237 1.22l.095.484-.064.065.048.336-.253-.03-.119.115.213.207.002-.002 1.548 1.559s.06.032 0 .09l-2.014 1.998s-.028.032-.063.032a.058.058 0 0 1-.038-.016l-1.813-1.795Zm-1.65 3.974 2.11 1.6 1.79 1.917-2.137 1.994-1.854-2.03-1.375-2.063-.366-.349 1.456-1.456.376.387Z' clip-rule='evenodd'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='a'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");
            transform: scale(0.9);
        }
        /* Nitro */
        :is([src="https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png"], 
        [src="https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png"], 
        [src='https://cdn.discordapp.com/badge-icons/11e2d339068b55d3a506cff34d3780f3.png'], 
        [src='https://cdn.discordapp.com/badge-icons/0d61871f72bb9a33a7ae568c1fb4f20a.png'], 
        [src="https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png"], 
        [src="https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png"], 
        [src="https://cdn.discordapp.com/badge-icons/0334688279c8359120922938dcb1d6f8.png"], 
        [src="https://cdn.discordapp.com/badge-icons/cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4.png"], 
        [src="https://cdn.discordapp.com/badge-icons/5b154df19c53dce2af92c9b61e6be5e2.png"])
        {
            content: url(https://discord.com/assets/379d2b3171722ef8be494231234da5d1.svg);
            width: 21px;
            height: 16px;
            transform: scale(1.5);
            margin-top: 1px;
            margin-right: 5px;
        }
        /* Partner */
        [src="https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png"]
        {
            content: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMS45NSI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2ZmZjsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMTQuNiwzLjE1bC0yLjQ5LDEuNjZjLS4yNS4yNS0uNjYuMTctLjc1LDAtLjI1LS4yNS0uNjYtLjQyLS45MS0uNS0uNjYtLjE3LTEuMjUsMC0xLjc0LjI1bC0uODMuNTgtNC42NSwyLjk5Yy0xLC42Ni0yLjI0LjQyLTIuOTEtLjY2LS42Ni0xLjA4LS4yNS0yLjI0Ljc1LTIuODJMNi4zOC45OUM3Ljg4LjE2LDkuNjItLjI1LDExLjI4LjE2YzEuNDEuMjUsMi42NiwxLDMuNDksMi4xNi4yNS4xNy4yNS42Ni0uMTcuODNaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjAsNS42NGMwLC43NS0uNDIsMS40MS0xLDEuNzRsLTUuNDgsMy41N2MtMSwuNjYtMi4yNCwxLTMuNCwxLS41LDAtMSwwLTEuNDEtLjE3LTEuNDEtLjI1LTIuNDktMS4xNi0zLjQ5LTIuMTYtLjE3LS4xNy0uMTctLjY2LjE3LS43NWwyLjQ5LTEuNjZjLjI1LS4yNS42Ni0uMTcuNzUsMCwuMjUuMjUuNS40Mi45MS41LjY2LjE3LDEuMjUsMCwxLjc0LS4yNWwxLjI1LS43NSwzLjc0LTIuNDkuNS0uNDJjMS0uNjYsMi4yNC0uNDIsMi45MS42Ni4xNy40Mi4zMy43NS4zMywxLjE2WiIvPgo8L3N2Zz4=") !important;
            transform: scale(0.5);
            width: 32px;
            margin-left: -5px;
            margin-right: -6px;
            height: 20px;
        }
        /* Moderator Program Alumni */
        [src="https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' fill='none'%3E%3Cpath fill='%23FFF' d='M13.77 0H4.23A3.74 3.74 0 0 1 .5 3.43v.9c0 4.4 2.09 8.5 5.74 11.4L9 17.9l2.76-2.16c3.65-2.83 5.74-7 5.74-11.4v-.9A3.8 3.8 0 0 1 13.77 0ZM7.3 12.9a9.08 9.08 0 0 1-3.6-7.08v-.53c1.19 0 2.23-.9 2.3-2.08h3v11.1L7.29 12.9Z'/%3E%3C/svg%3E");
            transform: scale(0.8);
        }
        /* HypeSquad Events */
        [src="https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png"]
        {
            content: url("data:image/svg+xml,%3csvg id='Layer_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 116.67 108.78'%3e%3cdefs%3e%3cstyle%3e.cls-1{fill:white;stroke-width:0}%3c/style%3e%3c/defs%3e%3cpath class='cls-1' d='m114.28 28.25-45.9 30.13c-.79.51-1.43 1.23-1.85 2.07l-7 14.03a1.291 1.291 0 0 1-1.2.78c-.26 0-.5-.07-.72-.21a1.33 1.33 0 0 1-.48-.57l-7-14.03a5.344 5.344 0 0 0-1.85-2.07L2.38 28.25c-.23-.27-.56-.45-.92-.48-.36-.03-.71.08-.99.31-.27.23-.45.56-.48.92-.03.36.08.71.31.99L19.48 67.3c.09.2.14.41.13.63s-.06.43-.16.62-.25.35-.43.48c-.18.12-.38.2-.6.23H6.92c-.28 0-.56.09-.79.25-.23.17-.4.4-.49.67s-.09.56 0 .83c.09.27.26.51.49.67l51.42 36.84c.24.16.51.25.8.25s.56-.09.8-.25l51.42-36.84c.23-.17.4-.4.49-.67s.09-.56 0-.83-.26-.51-.49-.67c-.23-.17-.51-.25-.79-.25H98.25c-.23 0-.45-.07-.64-.19-.2-.11-.36-.28-.48-.47s-.19-.41-.2-.64c-.01-.23.03-.45.13-.66l19.33-37.31c.23-.27.34-.63.31-.99a1.356 1.356 0 0 0-1.47-1.23c-.36.03-.69.2-.92.48Z'/%3e%3cpath class='cls-1' d='m59.35.62 4.71 9.61c.08.16.2.3.35.4.14.11.31.18.49.21l10.62 1.52c.21.03.4.12.56.25s.28.31.34.51.07.41.02.62c-.05.2-.16.39-.31.53l-7.69 7.47c-.12.13-.22.28-.27.45s-.07.35-.05.53l1.81 10.55c.04.2.02.41-.05.61-.08.19-.2.36-.37.48a1.2 1.2 0 0 1-.57.21c-.21.01-.41-.03-.59-.13l-9.5-4.97a1.002 1.002 0 0 0-1.02 0l-9.5 4.97c-.18.1-.39.15-.59.13a.971.971 0 0 1-.57-.21c-.17-.12-.3-.29-.37-.48-.08-.19-.09-.4-.05-.61l1.81-10.55c.02-.18 0-.36-.05-.53s-.15-.32-.27-.45l-7.69-7.47c-.15-.15-.26-.33-.31-.53-.05-.2-.04-.42.02-.62s.18-.38.34-.51c.16-.14.36-.22.56-.25l10.62-1.49c.18-.03.34-.11.49-.21.14-.11.26-.24.35-.4l4.7-9.6c.09-.19.23-.36.41-.48.18-.12.38-.18.6-.18.21 0 .42.05.6.16s.33.27.42.46Z'/%3e%3c/svg%3e");
            transform: scale(0.9);
        }
        /* HypeSquad Balance */
        [src="https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png"]
        {
            content: url(https://discord.com/assets/2a085ed9c86f3613935a6a8667ba8b89.svg);
            transform: scale(0.9);
        }
        /* HypeSquad Bravery */
        [src="https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png"]
        {
            content: url(https://discord.com/assets/1115767aed344e96a27a12e97718c171.svg);
            transform: scale(0.7);
        }
        /* HypeSquad Brilliance */
        [src="https://cdn.discordapp.com/badge-icons/011940fd013da3f7fb926e4a1cd2e618.png"]
        {
            content: url(https://discord.com/assets/d3478c6bd5cee0fc600e55935ddc81aa.svg);
            transform: scale(0.8);
        }
        /* Early Supporter */
        [src="https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png"]
        {
            content: url(https://discord.com/assets/ce15562552e3d70c56d5408cfeed2ffd.svg);
            width: 22px;
            height: 16px;
            transform: scale(1.3);
        }
        /* Pomelo */
        [src="https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png"]
        {
            content: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_4488_19832)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 24C18.6274 24 24 18.6274 24 12C24 5.37259 18.6274 0 12 0C5.37259 0 0 5.37259 0 12C0 18.6274 5.37259 24 12 24ZM10.4644 5.82922C10.976 5.91449 11.3216 6.39836 11.2364 6.90997L10.9249 8.77859H14.3524L14.7153 6.60118C14.8006 6.08957 15.2845 5.74395 15.7961 5.82922C16.3077 5.91449 16.6533 6.39836 16.568 6.90997L16.2566 8.77859H17.4191C17.9377 8.77859 18.3582 9.19906 18.3582 9.71773C18.3582 10.2364 17.9377 10.6568 17.4191 10.6568H15.9435L15.4667 13.5179H16.8267C17.3453 13.5179 17.7658 13.9385 17.7658 14.4571C17.7658 14.9758 17.3453 15.3962 16.8267 15.3962H15.1537L14.7908 17.5736C14.7055 18.0853 14.2217 18.4309 13.7101 18.3456C13.1984 18.2603 12.8528 17.7765 12.9381 17.2649L13.2495 15.3962H9.82198L9.45908 17.5736C9.37382 18.0853 8.88994 18.4309 8.37834 18.3456C7.86673 18.2603 7.52111 17.7765 7.60637 17.2649L7.91781 15.3962H6.75543C6.23675 15.3962 5.8163 14.9758 5.8163 14.4571C5.8163 13.9385 6.23675 13.5179 6.75543 13.5179H8.23085L8.70771 10.6568H7.34784C6.82917 10.6568 6.40871 10.2364 6.40871 9.71773C6.40871 9.19906 6.82917 8.77859 7.34784 8.77859H9.02075L9.38366 6.60118C9.46892 6.08957 9.95279 5.74395 10.4644 5.82922ZM14.0394 10.6568L13.5625 13.5179H10.135L10.6119 10.6568H14.0394Z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E%0A");
            transform: scale(0.8);
        }
        /* Active Developer */
        [src="https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none'%3E%3Cpath fill='%23FFF' fill-rule='evenodd' d='M2 0a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Zm4.2 15h2.5c0-2-1-3.9-2.5-5 1.5-1.1 2.5-3 2.5-5H6.2c0 2-1.6 3.8-3.7 3.8v2.4c2 0 3.7 1.7 3.7 3.8Zm7.6 0c0-2 1.6-3.8 3.7-3.8V8.8c-2 0-3.7-1.7-3.7-3.8h-2.5c0 2 1 3.9 2.5 5a6.2 6.2 0 0 0-2.5 5h2.5Z' clip-rule='evenodd'/%3E%3C/svg%3E");
            transform: scale(0.6);
        }
        /* Early Verified Bot Developer */
        [src="https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png"]
        {
            content: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 115.91 100.22'%3e%3cpath d='M113.81 46.61 88.84 3.5 86.8 0H28.99l-2.04 3.5L2.04 46.61 0 50.11l2.04 3.5 24.91 43.11 2.04 3.5h57.87l2.04-3.5 24.97-43.11 2.04-3.5-2.1-3.5ZM37.57 40.6l-9.51 9.51 9.51 9.51v15.93L12.14 50.12l25.49-25.49v15.98h-.06Zm18.2 40.42-11.9-3.67 18.08-58.22 11.9 3.73-18.08 58.16Zm22.51-5.42V59.68l9.51-9.57-9.51-9.51V24.62l25.43 25.49L78.28 75.6Z' style='fill:white;stroke-width:0'/%3e%3c/svg%3e");
            transform: scale(0.7);
            width: 23px;
            margin-left: -1.45px;
        }
        /* Bug Hunter Level 1 */
        [src="https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none'%3E%3Cg fill='%23fff' clip-path='url(%23a)'%3E%3Cpath fill-opacity='.6' d='M14.58.64s7.67 5.23 4.76 12.59c-2.92 7.35-8.71 5.31-6.55 3.16 2.17-2.15-2.55-3.6-5.58-6.4L14.58.65'/%3E%3Cpath d='M14.12 7.84c-1.62 2.06-3.9 3.09-5.67 2.71L2.3 18.4a1.28 1.28 0 0 1-2.12-.16 1.28 1.28 0 0 1 .1-1.43L6.4 8.98c-.81-1.62-.37-4.1 1.28-6.19C9.72.21 12.79-.76 14.58.64c1.78 1.4 1.56 4.61-.46 7.2Z'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='a'%3E%3Cpath fill='%23fff' d='M0 0h20v20H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");
            transform: scale(0.85);
        }
        /* Bug Hunter Level 2 */
        [src="https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath fill='%23fff' fill-opacity='.45' d='M8.44 10.55c1.8.38 4.1-.65 5.7-2.7 1.99-2.62 2.24-5.91.45-7.25 0 0 7.69 5.26 4.73 12.63-2.95 7.38-8.72 5.33-6.53 3.15 1.49-1.47-.2-2.6-2.4-4.05-.7-.46-1.45-.96-2.16-1.51l.2-.27Z'/%3E%3Cpath fill='%23fff' fill-opacity='.65' d='M14.14 7.85c-1.6 2.05-3.9 3.08-5.7 2.7l-6.15 7.88c-.44.57-1.22.64-1.8.2a1.32 1.32 0 0 1-.25-1.8L6.39 9c-.83-1.6-.38-4.1 1.29-6.22C9.73.22 12.79-.73 14.58.6c1.8 1.34 1.55 4.63-.44 7.25Z'/%3E%3Cmask id='a' width='16' height='19' x='0' y='0' maskUnits='userSpaceOnUse' style='mask-type:luminance'%3E%3Cpath fill='%23fff' d='M14.14 7.85c-1.6 2.05-3.9 3.08-5.7 2.7l-6.15 7.88c-.44.57-1.22.64-1.8.2a1.32 1.32 0 0 1-.25-1.8L6.39 9c-.83-1.6-.38-4.1 1.29-6.22C9.73.22 12.79-.73 14.58.6c1.8 1.34 1.55 4.63-.44 7.25Z'/%3E%3C/mask%3E%3Cg fill='%23fff' mask='url(%23a)'%3E%3Cpath d='m11.04-3.27.74.1-3.16 23.96-.74-.1 3.16-23.96Zm1.24-.25 1.62.22-3.15 23.96-1.63-.22 3.16-23.96Z'/%3E%3C/g%3E%3C/svg%3E");
            transform: scale(0.85);
        }
        /* Server Booster Level 1 */
        [src="https://cdn.discordapp.com/badge-icons/51040c70d4f20a921ad6674ff86fc95c.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cpath fill='%23fff' d='M12 4 2 20h20L12 4Zm0 5.66L16.59 17H7.41L12 9.66Z' opacity='.55'/%3E%3Cpath fill='%23fff' d='M7.41 17 12 9.66 16.59 17H7.41Z' opacity='.8'/%3E%3Cpath fill='%23fff' d='M12 4v5.66L16.59 17 22 20 12 4Z'/%3E%3C/svg%3E");
        }
        /* Server Booster Level 2 */
        [src="https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cpath fill='%23fff' d='M12 2.7 2.7 12l9.3 9.3 9.3-9.3L12 2.7Zm0 14.65L6.65 12 12 6.65 17.35 12 12 17.35Z' opacity='.55'/%3E%3Cpath fill='%23fff' d='M12 6.65 6.63 12 12 17.35 17.35 12l-5.36-5.35Z' opacity='.8'/%3E%3Cpath fill='%23fff' d='M12 2.7v3.95L17.35 12h3.95L12 2.7Z'/%3E%3C/svg%3E");
        }
        /* Server Booster Level 3 */
        [src="https://cdn.discordapp.com/badge-icons/72bed924410c304dbe3d00a6e593ff59.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cpath fill='%23fff' d='M12 2.7 6.54 8.16v7.68L12 21.3l5.46-5.46V8.16L12 2.7Zm2.73 12L12 17.44l-2.73-2.73V9.29L12 6.56l2.73 2.73v5.41Z' opacity='.55'/%3E%3Cpath fill='%23fff' d='M9.27 9.29v5.42L12 17.44l2.73-2.73V9.29L12 6.56 9.27 9.29Z' opacity='.8'/%3E%3Cpath fill='%23fff' d='M12 2.7v3.86l2.73 2.73 2.73-1.13L12 2.7Z'/%3E%3C/svg%3E");
        }
        /* Server Booster Level 4 */
        [src="https://cdn.discordapp.com/badge-icons/df199d2050d3ed4ebf84d64ae83989f8.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cpath fill='%23fff' d='M12 3.3 4.46 7.65v8.71l2.62-1.51V9.16L12 6.31l4.93 2.85v5.69L12 17.69v3l7.54-4.35V7.65L12 3.3Z' opacity='.55'/%3E%3Cpath fill='%23fff' d='M12 3.29v3.02l4.93 2.85 2.61-1.51L12 3.29Z'/%3E%3Cpath fill='%23fff' d='m7.08 14.85-2.62 1.51L12 20.7v-3.01l-4.92-2.84Z' opacity='.4'/%3E%3Cpath fill='%23fff' d='m15.68 8.44-8.6 4.98V9.16L12 6.31l3.68 2.13Zm1.25.72v1.51l-8.54 4.94-1.31-.76 9.85-5.69Zm-7.31 7.15 7.31-4.22v2.75L12 17.69l-2.38-1.38Z' opacity='.75'/%3E%3Cpath fill='%23fff' d='m16.93 9.16-9.85 5.69v-1.43l8.6-4.98 1.25.72Zm0 1.51v1.42l-7.31 4.22-1.23-.7 8.54-4.94Z'/%3E%3C/svg%3E");
        }
        /* Server Booster Level 5 */
        [src="https://cdn.discordapp.com/badge-icons/996b3e870e8a22ce519b3a50e6bdd52f.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cpath fill='%23fff' d='M17 7v10H7l-1.4 3h12.81L20 18.41V5.59L17 7Zm0 0 1.4-3H5.59L4 5.59v12.82L7 17V7h10Z' opacity='.55'/%3E%3Cpath fill='%23fff' d='m18.41 4-1.4 2.99L20 5.59 18.41 4ZM4 18.41l2.99-1.4L5.59 20 4 18.41Z' opacity='.4'/%3E%3Cpath fill='%23fff' d='m5.59 4 1.4 2.99h10.02L18.41 4H5.59Z'/%3E%3Cpath fill='%23fff' d='m20 18.41-2.99-1.4 1.4 2.99L20 18.41ZM15.18 6.99l-8.19 8.18V6.99h8.19Zm1.83 0v2.12l-7.9 7.9H6.99V17L17.01 6.99Zm-6.07 10.02 6.07-6.07v6.07h-6.07Z' opacity='.75'/%3E%3Cpath fill='%23fff' d='M17.01 6.99 6.99 17.01v-1.84l8.19-8.18h1.83Zm0 2.12v1.83l-6.07 6.07H9.11l7.9-7.9Z'/%3E%3C/svg%3E");
        }
        /* Server Booster Level 6 */
        [src="https://cdn.discordapp.com/badge-icons/991c9f39ee33d7537d9f408c3e53141e.png"]
        {
            content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none'%3E%3Cg clip-path='url(%23a)'%3E%3Cmask id='b' width='24' height='24' x='0' y='0' maskUnits='userSpaceOnUse' style='mask-type:luminance'%3E%3Cpath fill='%23fff' d='M24 0H0v24h24V0Z'/%3E%3C/mask%3E%3Cg fill='%23fff' mask='url(%23b)'%3E%3Cpath d='m4.62 5.81-.4.84a.22.22 0 0 0 .3.3l.88-.4a.23.23 0 0 1 .2 0l.84.4a.23.23 0 0 0 .31-.3l-.4-.84a.18.18 0 0 1 0-.2l.4-.84a.23.23 0 0 0-.35-.31l-.84.4a.23.23 0 0 1-.2 0l-.84-.4a.23.23 0 0 0-.3.31l.4.84a.23.23 0 0 1 0 .2Z' opacity='.6'/%3E%3Cpath d='m14.9 12.96.03 3.1-2.15-.72-.8-.27-.79.27-2.14.72.02-2.26.01-.84-.5-.67-1.35-1.82 2.16-.68.81-.25.48-.69 1.3-1.83 1.32 1.84.48.68.81.25 2.15.68-1.34 1.82-.5.67Z' opacity='.75'/%3E%3Cpath d='M11.98 2.7v4.32l1.8 2.52 2.96.93 4.1-1.33-5.51-1.73-3.35-4.71Z'/%3E%3Cpath d='m11.98 15.07.8.27 2.15.72 2.53 3.49-5.48-1.84v-2.64ZM3.12 9.14l5.52-1.73 3.34-4.71v4.32l-1.3 1.83-.48.69-.81.25-2.16.68 1.35 1.82.5.67-2.51.82-3.45-4.64Zm17.72 0-4.1 1.33-1.34 1.82-.5.67 2.5.82 3.44-4.64Z' opacity='.55'/%3E%3Cpath d='M19.01 16.14h.01c.24 0 .44-.2.44-.44v-.89c0-.24-.2-.44-.44-.44h-.01c-.24 0-.44.2-.44.44v.89c0 .24.2.44.44.44Zm0 3.54h.01c.24 0 .44-.2.44-.44v-.89c0-.24-.2-.44-.44-.44h-.01c-.24 0-.44.2-.44.44v.89c0 .24.2.44.44.44Zm-.87-2.66v-.01c0-.24-.2-.44-.44-.44h-.89c-.24 0-.44.2-.44.44v.01c0 .24.2.44.44.44h.89c.24 0 .44-.2.44-.44Zm3.54.01v-.01c0-.24-.2-.44-.44-.44h-.89c-.24 0-.44.2-.44.44v.01c0 .24.2.44.44.44h.89c.24 0 .44-.2.44-.44Zm-7.9-7.49-4.7 3.42-.61-.81 4.72-3.43.59.82Zm2.96.93-7.69 5.59.01-1.26 6.48-4.71 1.2.38Z'/%3E%3Cpath d='m6.51 19.55 5.47-1.84v-2.64l-.28.09-.51.18-2.14.72.02-2.26.01-.84-2.51.82-.06 5.77Z' opacity='.4'/%3E%3Cpath d='m17.4 13.78-2.5-.82.03 3.1 2.53 3.49-.06-5.77Z' opacity='.75'/%3E%3C/g%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='a'%3E%3Cpath fill='%23fff' d='M0 0h24v24H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");
        }
        /* Server Booster Level 7 */
        [src="https://cdn.discordapp.com/badge-icons/cb3ae83c15e970e8f3d410bc62cb8b99.png"]
        {
            content: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.6'%3E%3Cpath opacity='0.6' d='M6.3599 4.33012L6.7699 5.17012C6.79235 5.21348 6.80042 5.26286 6.79294 5.31111C6.78546 5.35936 6.76281 5.40398 6.72829 5.43851C6.69376 5.47304 6.64914 5.49568 6.60089 5.50316C6.55264 5.51064 6.50326 5.50257 6.4599 5.48012L5.6199 5.07012C5.58871 5.05506 5.55453 5.04724 5.5199 5.04724C5.48527 5.04724 5.45108 5.05506 5.4199 5.07012L4.5799 5.48012C4.53654 5.50257 4.48716 5.51064 4.4389 5.50316C4.39065 5.49568 4.34603 5.47304 4.31151 5.43851C4.27698 5.40398 4.25434 5.35936 4.24686 5.31111C4.23938 5.26286 4.24744 5.21348 4.2699 5.17012L4.6799 4.33012C4.69495 4.29893 4.70277 4.26475 4.70277 4.23012C4.70277 4.19549 4.69495 4.16131 4.6799 4.13012L4.2699 3.29012C4.25405 3.24759 4.25114 3.20133 4.26154 3.15715C4.27193 3.11298 4.29516 3.07286 4.3283 3.04186C4.36144 3.01086 4.40301 2.99035 4.44778 2.98292C4.49255 2.9755 4.53852 2.98148 4.5799 3.00012L5.4199 3.41012C5.45108 3.42518 5.48527 3.433 5.5199 3.433C5.55453 3.433 5.58871 3.42518 5.6199 3.41012L6.4599 3.00012C6.50326 2.97767 6.55264 2.9696 6.60089 2.97708C6.64914 2.98456 6.69376 3.0072 6.72829 3.04173C6.76281 3.07626 6.78546 3.12087 6.79294 3.16913C6.80042 3.21738 6.79235 3.26676 6.7699 3.31012L6.3599 4.15012C6.34779 4.17858 6.34156 4.20919 6.34156 4.24012C6.34156 4.27105 6.34779 4.30166 6.3599 4.33012Z' fill='white'/%3E%3C/g%3E%3Cpath opacity='0.55' d='M12 2.69995L6.54004 8.15995V15.8499L9.27004 14.7199V9.28995L12 6.55995L14.72 9.28995V14.7199L12 17.4499V21.2999L17.45 15.8499V8.15995L12 2.69995Z' fill='white'/%3E%3Cpath d='M12 2.69995V6.55995L14.73 9.28995L17.46 8.15995L12 2.69995Z' fill='white'/%3E%3Cpath opacity='0.4' d='M9.27004 14.71L6.54004 15.84L12 21.3V17.44L9.27004 14.71Z' fill='white'/%3E%3Cpath d='M16.2199 17.6999H16.2299C16.4729 17.6999 16.6699 17.5029 16.6699 17.2599V16.3699C16.6699 16.1269 16.4729 15.9299 16.2299 15.9299H16.2199C15.9769 15.9299 15.7799 16.1269 15.7799 16.3699V17.2599C15.7799 17.5029 15.9769 17.6999 16.2199 17.6999Z' fill='white'/%3E%3Cpath d='M16.2199 21.25H16.2299C16.4729 21.25 16.6699 21.053 16.6699 20.81V19.92C16.6699 19.677 16.4729 19.48 16.2299 19.48H16.2199C15.9769 19.48 15.7799 19.677 15.7799 19.92V20.81C15.7799 21.053 15.9769 21.25 16.2199 21.25Z' fill='white'/%3E%3Cpath d='M15.3401 18.5899V18.5799C15.3401 18.3369 15.1431 18.1399 14.9001 18.1399H14.0101C13.7671 18.1399 13.5701 18.3369 13.5701 18.5799V18.5899C13.5701 18.8329 13.7671 19.0299 14.0101 19.0299H14.9001C15.1431 19.0299 15.3401 18.8329 15.3401 18.5899Z' fill='white'/%3E%3Cpath d='M18.8799 18.5899V18.5799C18.8799 18.3369 18.6829 18.1399 18.4399 18.1399H17.5499C17.3069 18.1399 17.1099 18.3369 17.1099 18.5799V18.5899C17.1099 18.8329 17.3069 19.0299 17.5499 19.0299H18.4399C18.6829 19.0299 18.8799 18.8329 18.8799 18.5899Z' fill='white'/%3E%3Cpath opacity='0.75' d='M9.28003 9.29006V14.7101L12.01 17.4401L14.73 14.7101V9.29006L12.01 6.56006L9.28003 9.29006Z' fill='white'/%3E%3Cpath d='M14.73 9.29004V9.30004L9.29003 14.7301L9.28003 14.7201V13.2501L13.99 8.54004L14.73 9.29004Z' fill='white'/%3E%3Cpath d='M14.7301 11.3401V12.8401L11.0701 16.5001L10.3201 15.7501L14.7301 11.3401Z' fill='white'/%3E%3C/svg%3E%0A");
        }
        /* Server Booster Level 8 */
        [src="https://cdn.discordapp.com/badge-icons/7142225d31238f6387d9f09efaa02759.png"]
        {
            content: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath opacity='0.55' d='M12 3.30005L4.45996 7.65005V16.3601L7.06996 14.8501V9.16005L12 6.31005L16.92 9.16005V14.8501L12 17.6901V20.6901L19.54 16.3401V7.65005L12 3.30005Z' fill='white'/%3E%3Cg opacity='0.6'%3E%3Cpath opacity='0.6' d='M6.3599 4.33012L6.7699 5.17012C6.79235 5.21348 6.80042 5.26286 6.79294 5.31111C6.78546 5.35936 6.76281 5.40398 6.72829 5.43851C6.69376 5.47304 6.64914 5.49568 6.60089 5.50316C6.55264 5.51064 6.50326 5.50257 6.4599 5.48012L5.6199 5.07012C5.58871 5.05506 5.55453 5.04724 5.5199 5.04724C5.48527 5.04724 5.45108 5.05506 5.4199 5.07012L4.5799 5.48012C4.53654 5.50257 4.48716 5.51064 4.4389 5.50316C4.39065 5.49568 4.34603 5.47304 4.31151 5.43851C4.27698 5.40398 4.25434 5.35936 4.24686 5.31111C4.23938 5.26286 4.24744 5.21348 4.2699 5.17012L4.6799 4.33012C4.69495 4.29893 4.70277 4.26475 4.70277 4.23012C4.70277 4.19549 4.69495 4.16131 4.6799 4.13012L4.2699 3.29012C4.25405 3.24759 4.25114 3.20133 4.26154 3.15715C4.27193 3.11298 4.29516 3.07286 4.3283 3.04186C4.36144 3.01086 4.40301 2.99035 4.44778 2.98292C4.49255 2.9755 4.53852 2.98148 4.5799 3.00012L5.4199 3.41012C5.45108 3.42518 5.48527 3.433 5.5199 3.433C5.55453 3.433 5.58871 3.42518 5.6199 3.41012L6.4599 3.00012C6.50326 2.97767 6.55264 2.9696 6.60089 2.97708C6.64914 2.98456 6.69376 3.0072 6.72829 3.04173C6.76281 3.07626 6.78546 3.12087 6.79294 3.16913C6.80042 3.21738 6.79235 3.26676 6.7699 3.31012L6.3599 4.15012C6.34779 4.17858 6.34156 4.20919 6.34156 4.24012C6.34156 4.27105 6.34779 4.30166 6.3599 4.33012Z' fill='white'/%3E%3C/g%3E%3Cpath d='M17.59 17.8601H17.6C17.843 17.8601 18.04 17.6631 18.04 17.4201V16.5301C18.04 16.2871 17.843 16.0901 17.6 16.0901H17.59C17.347 16.0901 17.15 16.2871 17.15 16.5301V17.4201C17.15 17.6631 17.347 17.8601 17.59 17.8601Z' fill='white'/%3E%3Cpath d='M17.59 21.3999H17.6C17.843 21.3999 18.04 21.2029 18.04 20.9599V20.0699C18.04 19.8269 17.843 19.6299 17.6 19.6299H17.59C17.347 19.6299 17.15 19.8269 17.15 20.0699V20.9599C17.15 21.2029 17.347 21.3999 17.59 21.3999Z' fill='white'/%3E%3Cpath d='M16.7099 18.75V18.74C16.7099 18.497 16.5129 18.3 16.2699 18.3H15.3799C15.1369 18.3 14.9399 18.497 14.9399 18.74V18.75C14.9399 18.993 15.1369 19.1901 15.3799 19.1901H16.2699C16.5129 19.1901 16.7099 18.993 16.7099 18.75Z' fill='white'/%3E%3Cpath d='M20.26 18.75V18.74C20.26 18.497 20.063 18.3 19.82 18.3H18.93C18.687 18.3 18.49 18.497 18.49 18.74V18.75C18.49 18.993 18.687 19.1901 18.93 19.1901H19.82C20.063 19.1901 20.26 18.993 20.26 18.75Z' fill='white'/%3E%3Cpath d='M12 3.29004V6.31004L16.93 9.15004L19.54 7.65004L12 3.29004Z' fill='white'/%3E%3Cpath opacity='0.4' d='M7.06996 14.8501L4.45996 16.3501L12 20.7101V17.6901L7.06996 14.8501Z' fill='white'/%3E%3Cpath opacity='0.75' d='M15.6901 8.43006L7.07007 13.4201V9.15006L12.0001 6.31006L15.6901 8.43006Z' fill='white'/%3E%3Cpath opacity='0.75' d='M16.9301 9.1499V10.6699L8.39008 15.6099L7.08008 14.8399L16.9301 9.1499Z' fill='white'/%3E%3Cpath opacity='0.75' d='M9.62012 16.3101L16.9301 12.0901V14.8401L12.0001 17.7001L9.62012 16.3101Z' fill='white'/%3E%3Cpath d='M16.9301 9.14993L7.08008 14.8399V13.4199L15.6901 8.42993L16.9301 9.14993Z' fill='white'/%3E%3Cpath d='M8.38989 15.6099L9.61989 16.3099L16.9299 12.0899V10.6699L8.38989 15.6099Z' fill='white'/%3E%3C/svg%3E%0A");
        }
        /* Server Booster Level 9 */
        [src="https://cdn.discordapp.com/badge-icons/ec92202290b48d0879b7413d2dde3bab.png"]
        {
            content: url(https://discord.com/assets/cfbc2d8ceacfacf07850f986c8165195.svg);
        }
        /* Completed a Quest */
        [src="https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png"]
        {
            content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAAEYJBGSAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAVxJREFUeNqdkD9KRDEQxn9rxFgIaSwsxIAnsLTaQbyBN/AGdlosJp7AC4nEk/hAsN1XbhHemDeElcVm8SPz8WX+ZSYAF3AH9/n3nMMBAKfwCLfwATfwxRy6xODfYBkyZw6eXObag8SMr+zAX0G4BhFYReY8swefzZ76fRUyywhuBL+Bw2P+Ql4LHKXwBWFymokDKRMKAlKITeSZo7Gf/ZZTiJuFZvynTkBoEp7dwH6IEUBiAdLMJxq+4WIKa4jVK9YfYiEZC53ntUAyUkiZ2BnpbMI4FJbMnEBsr8baeGyT91e86rvNDxCNkxZg5QfggcJ/kJgweH3RAWve1MaUKFoBaprQSWChqSKT5qZ0JGhTTmsfxlldtOhI/2zr6hVIpipELeYbu3LWald5HXC9trDoKoNY58r2tULoEwx4VUCtVu1a5sCENgPfvJoLWPp2c+2bi661YqrgNvv/4g9K3sljKA20yAAAAABJRU5ErkJggg==");
        }
    }
    `
)

function webpackify(css) {
    for (const key in styles) {
        let regex = new RegExp(`\\.${key}([\\s,.):>])`, 'g');
        css = css.replace(regex, `.${styles[key]}$1`);
    }
    return css;
}

function Starter({props, res}) {
    const options = {
        walkable: [
            'props',
            'children'
        ],
        ignore: []
    };
    const data = Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'initialSection'), options)
    const user = data.user;
    const currentUser = data.currentUser;
    const displayProfile = data.displayProfile;
    const [tab, setTab] = useState(tabs.ABOUT);
    const ref = useRef(null);

    const detailsCheck = useMemo(() => { 
        if (!data.displayProfile._userProfile) return null;
        return data.displayProfile._userProfile; }, [ data.displayProfile._userProfile ]
    );
    if (!detailsCheck) return;
    //console.log(Utils.findInTree(props, (tree) => Object.hasOwn(tree, 'initialSection'), options))
    console.log(res)
    return [
        createElement(headerBuilder, {props, user, currentUser, displayProfile, tab, setTab, ref}),
        createElement(bodyBuilder, {props, data, user, displayProfile, tab, setTab, ref})
    ]
}

module.exports = class ProfileRestructure {
    constructor(meta){}
    start() {
        DOM.addStyle('profileCSS', profileCSS);
        Patcher.after("ProfileRestructure", entireProfileModal, "z", (that, [props], res) => {
            if (!props.children.props.themeType?.includes("MODAL_V2")) return;
            if (!Utils.findInTree(props, x => x?.displayProfile, { walkable: ['props', 'children'] })) return;

            return createElement(Starter, {props, res})
        })
    }
    stop() {
        Patcher.unpatchAll("ProfileRestructure");
        DOM.removeStyle('profileCSS');
    }

    getSettingsPanel() {
        return [
            createElement(() => Object.keys(settings.main).map((key) => {
                    const [state, setState] = useState(Data.load('ProfileRestructure', key));
                    const { name, note, changed } = settings.main[key];

                    return createElement(FormSwitch, {
                        children: name,
                        note: note,
                        value: state,
                        hideBorder: 1,
                        onChange: (v) => {
                            Data.save('ProfileRestructure', key, v);
                            setState(v);
                            if (changed)
                                changed(v);
                        }
                    });
                }
            )),
            createElement(Components.SettingGroup, {
            name: "Server Profile Settings",
            collapsible: true,
            shown: false,
            children:
                createElement(() => Object.keys(settings.serverCategory).map((key) => {
                    const [state, setState] = useState(Data.load('ProfileRestructure', key));
                    const { name, note, changed } = settings.serverCategory[key];

                    return createElement(FormSwitch, {
                        children: name,
                        note: note,
                        value: state,
                        onChange: (v) => {
                            Data.save('ProfileRestructure', key, v);
                            setState(v);
                            if (changed)
                                changed(v);
                        }
                    });
                }))
            }
        )
	]}
}