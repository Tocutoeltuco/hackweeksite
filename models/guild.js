const socket = require('../helpers/socket'),
	  cogs = require('../helpers/cogs');

const checkStr = (str, maxLen) => ((typeof str == 'string') && str.length <= maxLen)

const Guild = {
	cogs: cogs,
	findById(id) {
		return socket.request({type: 'guild_info', guild_id: id});
	},
	checkGuilds(userId, list) {
		return socket.request({type: 'guild_list', user_id: userId, list: list});
	},
	setPermissions(id, perms) {
		return socket.request({type: 'set_permissions', guild_id: id, permissions: perms});
	},
	save(params) {
		return new Promise( (resolve, reject) => {
			const response = { conf: {}, cogs: {} };
			if (checkStr(params.guild, 21) && params.guild)
				response.guild_id = params.guild;
			else
				reject({}); //internal error;
			if (checkStr(params.prefix, 5))
				response.conf.prefix = params.prefix || '.';
			else
				reject({}); //internal error;
			if (params.welcome) {
				if (checkStr(params.welcome_channel, 21) && checkStr(params.welcome_message, 1000)) {
					response.conf.welcome_channel = params.welcome_channel;
					response.conf.welcome_message = params.welcome_message; 
				} else
					reject({}); //internal error;
			} else {
				response.conf.welcome_channel = '';
			}
			if (params.goodbye) {
				if (checkStr(params.goodbye_channel, 21) && checkStr(params.goodbye_message, 1000)) {
					response.conf.goodbye_channel = params.goodbye_channel;
					response.conf.goodbye_message = params.goodbye_message; 
				} else
					reject({}); //internal error;
			} else {
				response.conf.goodbye_channel = '';
			}
			const permissions = {};
			for (const cog in cogs) {
				if (cogs.hasOwnProperty(cog)) {
					response.cogs[cog] = !!params[cog];
					for (const cmd of cogs[cog].cmds) {
						permissions[cmd.permission] =  {
							granted_when: {
						        big_role_list: params[cmd.permission+"_big_roles"],
						        role_list: params[cmd.permission+"_allowed_channels"],
						        channel_list: params[cmd.permission+"_allowed_roles"]
						    },
						    not_granted_when: {
						        role_list: params[cmd.permission+"_denied_roles"],
						        channel_list: params[cmd.permission+"_denied_roles"]
						    },
						    default: !!params[cmd.permission+"_default"]
						}
					}
				}
			}
			permissions.edit_guild_config = {
				granted_when: {
					granted_when: {
				        big_role_list: params.edit_guild_config,
				        role_list: [],
				        channel_list: []
				    },
				    not_granted_when: {
				        role_list: [],
				        channel_list: []
				    },
				    default: false
				}
			}
			this.setPermissions(response.guild_id, permissions);
			response.type = 'set_guild_info';
			resolve(socket.request(response));
		});
	}
}

module.exports = Guild;