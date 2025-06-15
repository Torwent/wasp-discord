import { ClientEvent } from "$lib/event";
import { supabase } from "$lib/supabase";

const discordRoles = {
  moderator: "Moderator",
  scripter: "Scripter",
  tester: "Tester"
};

interface UserRoles {
  id: string;
  roles: {
    moderator: boolean;
    scripter: boolean;
    tester: boolean;
  };
}

export default new ClientEvent("guildMemberUpdate", async (user) => {
    const member = await user.guild.members.fetch({ user: user.id, force: true });
    const rolesCache = member.guild.roles.cache;

    // Helper function to find role by name, with fallback to fetch if not cached
    async function getRoleByName(name: string) {
      let role = rolesCache.find(r => r.name.toLowerCase() === name.toLowerCase());
      if (!role) {
        try {
          const roles = await member.guild.roles.fetch();
          role = roles.find(r => r.name.toLowerCase() === name.toLowerCase());
        } catch (err) {
          console.error(`Could not fetch roles to find "${name}":`, err);
        }
      }
      return role;
    }

    // Fetch all relevant roles dynamically
    const rolesByName: Record<string, import("discord.js").Role | undefined> = {};
    for (const key of Object.keys(discordRoles)) {
      rolesByName[key] = await getRoleByName(discordRoles[key]);
      if (!rolesByName[key]) {
        console.warn(`Role "${discordRoles[key]}" not found in guild.`);
      }
    }

    const { data, error: userError } = await supabase
      .schema("profiles")
      .from("profiles")
      .select("id, roles!left (moderator, scripter, tester)")
      .eq("discord", user.id)
      .single<UserRoles>();

    if (userError) {
      console.error(userError);
      return;
    }

    const dbRoles = data.roles;
    if (dbRoles == null) {
      console.error("User doesn't seem to have a roles entry.");
      return;
    }

    const { id } = data;

    // Build roleObject by checking if member has each role by ID
    const roleObject: Record<string, boolean> = {};
    for (const key of Object.keys(discordRoles)) {
      const role = rolesByName[key];
      roleObject[key] = role ? member.roles.cache.has(role.id) : false;
    }

    // Check if roles changed compared to DB
    if (
      data.roles.moderator === roleObject.moderator &&
      data.roles.scripter === roleObject.scripter &&
      data.roles.tester === roleObject.tester
    ) {
      return;
    }

    console.log("Discord user ", user.id, " roles changed: ", roleObject);

    const { error } = await supabase.schema("profiles").from("roles").update(roleObject).eq("id", id);

    if (error) {
      console.error(error);
      return;
    }
});
