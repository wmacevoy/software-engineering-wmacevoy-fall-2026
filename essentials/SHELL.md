# Essentials: The Shell

Everything else in this sequence is typed into a terminal. This is the one you read first so that
the rest of them make sense.

- **The fear it retires:** "I don't know where I am, or what I'm typing into."
- **The fence you prove:** From a fresh terminal: `cd ~/projects && pwd && which git && echo $HOME`
  prints what you expect, and you can explain every character of `git clone
  git@github.com:<user>/<repo>.git`.
- **Before this:** nothing
- **After this:** `GIT.md`

## The model

A shell is a small program that reads a line, splits it into words, runs the first word as a
command, and hands it the rest as arguments. That is all. Every fancy thing it does is built on that
one sentence.

```
you ──type──▶ terminal ──line──▶ shell ──runs──▶ program
                                   │                │
                          environment: $HOME,      stdin  ◀── keyboard, or a pipe
                          $PATH, $PWD, ...         stdout ──▶ screen, or a pipe, or a file
                                                   stderr ──▶ screen (even when stdout is redirected)
                                                   exit code: 0 means ok, anything else means not
```

Four things a program gets from the shell, and the fourth is the one people forget:

- **A working directory.** `pwd` prints it. Every relative path is relative to it. Half of "no such
  file" is being in the wrong one.
- **An environment.** Named strings, inherited by every program you start. `$HOME` is your home
  directory. `$PATH` is the list of directories searched for a command; "command not found" means
  the program is not in one of them. `printenv` shows them all.
- **Three streams.** Input, output, and errors. `|` connects one program's output to the next's
  input. `>` sends output to a file; `>>` appends; `2>&1` folds errors into output so a pipe sees
  both.
- **An exit code.** Zero is success. `echo $?` shows the last one. Continuous integration, `npm run
  check`, and every script in this repository use it as the idiot light: the number is the verdict,
  and the text is just for humans.

## Once per machine

**Windows.** Two options, and the second is the one this course assumes.

- *git-bash* from git-scm.com: a bash shell with git. `C:` appears as `/c/`.
- *Windows Subsystem for Linux.* Open PowerShell as administrator and run `wsl --install`, which
  gets you the current Ubuntu. Launch it, let it finish, create a user with no spaces in the name,
  then:

  ```sh
  sudo apt-get update
  sudo apt-get upgrade -y            # takes a while
  sudo apt-get install -y build-essential cmake git
  ```

  `C:/Users/<you>` is `/mnt/c/Users/<you>` inside WSL. It is tempting to keep projects there so
  Explorer can see them. Do not: files under `/mnt/c` cross a compatibility layer that is much
  slower for the many-small-files pattern git and compilers have, and a build that takes seconds in
  the Linux filesystem takes minutes there. Keep projects in your WSL home (`mkdir ~/projects`) and
  reach them from Explorer by typing `\\wsl$` in the address bar.

**Mac.** Terminal is built in. Install the command-line tools, which include git:

```sh
xcode-select --install
```

**Ubuntu.** The same three `apt-get` lines as WSL; you are already on Linux.

**Which shell.** Macs use `zsh`; Linux and WSL use `bash`. They agree on everything in this
document. `echo $SHELL` tells you which you have; the startup file is `~/.zshrc` or `~/.bashrc`,
and that is where a line like `export PATH="$HOME/bin:$PATH"` goes if you need one.

**An editor that knows about the terminal.** Visual Studio Code has a terminal pane, a source
control pane, and a merge-conflict view that `GIT.md` relies on. On Windows install the *WSL*
extension so that VS Code runs against the Linux side; then `code .` from any WSL directory opens
that directory. On Mac, run *Shell Command: Install 'code' command in PATH* once from the command
palette.

**A place for projects.** One directory, in your home, with a short lowercase name: `~/projects`.
Not `Projects` — why hit shift a thousand times — and not `p` either; the shell has tab completion.
On campus Windows machines your home may be a network drive with too little space and too much
latency for build artifacts; use `C:/Users/<you>/projects` there, and let git be the backup.

## Every day

| Want                          | Type                                   | Note                                                      |
| ----------------------------- | -------------------------------------- | --------------------------------------------------------- |
| where am I                    | `pwd`                                  |                                                           |
| what is here                  | `ls -la`                               | `-a` shows dotfiles like `.git` and `.env`                |
| go somewhere                  | `cd ~/projects/parking`                | `cd` alone goes home; `cd -` goes back                    |
| read a file                   | `cat f`, `less f`, `head -20 f`, `tail -f log` | `q` leaves `less`; `tail -f` follows a growing file |
| find text                     | `grep -rn "S-8" parking/`              | `-r` recursive, `-n` line numbers, `-i` ignore case       |
| find files                    | `find . -name '*.test.js'`             | quotes keep the shell from expanding `*` early            |
| make, copy, move, remove      | `mkdir -p a/b`, `cp`, `mv`, `rm`       | `rm` does not ask and there is no trash                   |
| which program will run        | `which node`                           | the first match on `$PATH`                                |
| how do I use this             | `git --help`, `man ls`                 |                                                           |
| stop it                       | `Ctrl-C`                               | `Ctrl-D` ends input; `:q!` leaves vim if you fell into it |
| that command again            | `Ctrl-R`, then type part of it         | reverse history search; `↑` walks history                 |
| finish the word for me        | `Tab`                                  | twice to list the choices                                 |
| chain                         | `a && b`                               | `b` runs only if `a` exited zero; `a ; b` runs both       |
| pipe                          | `git log --oneline \| head -5`         |                                                           |
| save output                   | `npm test > out.txt 2>&1`              |                                                           |

**Paths.** `~` is home, `.` is here, `..` is up one. A path starting with `/` is absolute;
anything else is relative to `pwd`. Quote paths with spaces: `cd "My Documents"`. And one trap
that bites git users on Macs: the default Mac filesystem is case-insensitive, so `Notes.md` and
`notes.md` are the same file to you and different files to git and to Linux. Name files in one
case and keep it.

**Variables.** `NAME=value` sets one for this shell; `export NAME=value` sets one that programs you
start will inherit. `DATABASE_URL=... npm start` sets one for a single command. That last form is
how `parking/` is run outside Docker, and it is how a secret gets into a process without touching
a file (`1PASSWORD.md`).

## Danger Will Robinson

- **`rm -rf $DIR`** with `DIR` unset is `rm -rf /`. Quote and check variables before deleting with
  them, or use a path that starts with `~/projects/`.
- **`curl … | sh`** runs whatever the server sent, as you. Download it first, read it, then run
  it. The installers in this sequence are fine; the habit is the problem.
- **`sudo`** means "as the administrator." If a command needs it and you do not know why, find
  out first. Nothing in a project directory should need it.
- **Spaces** split words. `git add my file.txt` adds two files, one of which does not exist.

## When it goes wrong

| It says                          | It means                                   | Do                                                          |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `command not found`              | not on `$PATH`, or not installed           | `which`; install it; check the startup file exports `PATH`  |
| `No such file or directory`      | wrong working directory, or a typo         | `pwd`; `ls`; tab-complete the name instead of typing it     |
| `Permission denied`              | not yours, or not executable               | `ls -l` to see the owner and mode; `chmod +x script.sh`     |
| nothing happens, cursor blinks   | the program is waiting for input or hung   | `Ctrl-C`; if it was waiting for input, that is what `Ctrl-D` is for |
| the screen is full of `~` lines  | you are in `less` or `vim`                 | `q`, or `Esc` then `:q!`                                    |
| `^M` at the ends of lines        | Windows line endings                       | `GIT.md` fixes this with one `.gitattributes` line          |
| it is slow under WSL             | the project is under `/mnt/c`              | move it to `~/projects` on the Linux side                   |

## Checklist

- [ ] A terminal opens and `echo $SHELL` names a shell you recognize.
- [ ] `~/projects` exists and is where projects go.
- [ ] `which git` prints a path.
- [ ] `code .` opens the current directory in an editor with a terminal pane.
- [ ] On Windows, the project is under the WSL home, not under `/mnt/c`.
- [ ] You can explain `|`, `>`, `2>&1`, and `$?` to a classmate.

## In `parking/`

Every command in `CLAUDE.md` is a shell command. `npm run check` is two of them joined with `&&`,
which is why the layering check gates the tests: a nonzero exit code stops the chain.
`cli/check-layering.sh` is forty lines of plain `sh` and worth reading as a first script — notice
`set -eu` at the top, which makes the script stop on the first error and refuse to use an unset
variable, which is exactly the `rm -rf $DIR` protection above, applied to itself.

## Resources

- The Missing Semester of Your CS Education (MIT) — the shell, the editor, and git, in a week.
- `man bash`, or `man zsh`, when you are ready for the full story. Not before.
