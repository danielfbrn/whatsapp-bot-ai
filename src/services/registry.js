class CommandRegistry {
  constructor() { this.commands = new Map(); }
  register(name, handler, options = {}) {
    const { description = '', usage = name, adminOnly = false } = options;
    this.commands.set(name.toLowerCase(), { handler, description, usage, adminOnly });
  }
  get(name)  { return this.commands.get(name.toLowerCase()); }
  has(name)  { return this.commands.has(name.toLowerCase()); }
  getAll()   { return Array.from(this.commands.entries()).map(([name, meta]) => ({ name, ...meta })); }
}

module.exports = new CommandRegistry();
