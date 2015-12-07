# Biu Command Pipeline

## Sample `biu.json`

```json
{
    "commands": [
        {
            // this is an npm command.
            // specify this to avoid some wild child process issue.
            "npm": true,
            "command": "tsc",
            "args": ["-p", "src/server/", "-w"],
            // pipe stdout of child process to stdout of biu.
            "stdout": true
        },
        {
            "npm": true,
            "command": "tsc",
            "args": ["-p", "src/page/", "-w"],
            "stdout": true
        },
        {
            "npm": true,
            "command": "fis3",
            "args": ["release", "-r", "src/static/", "-d", "bld/", "-c", "-w"]
        }
    ]
}
```
