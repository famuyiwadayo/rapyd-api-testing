export default function log(tag: string, ...args: any[]): void {
  console.log(`\x1b[33m[${tag}]\x1b[0m\x1b[34m`, ...args, "\x1b[0m");
}
