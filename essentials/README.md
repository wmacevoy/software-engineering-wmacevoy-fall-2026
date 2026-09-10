# Essentials

The tools, in the order a student needs them. Each document has the same shape — the fear it
retires, the fence you prove, a model, once per machine, once per repository, every day, when it
goes wrong, a checklist, and where it shows up in `parking/` — so that once you have read one you can
guess how the next is organized.

Read them in order. Each one assumes the one before it, and each ends with something you can
demonstrate.

| # | Read                  | The fear it retires                                          | The fence you prove                                                              |
| - | --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 0 | `SHELL.md`            | "I don't know where I am, or what I'm typing into."          | a fresh terminal lands in `~/projects` and you can read a `git clone` line       |
| 1 | `GIT.md`              | "I can't get back to when it worked." "Nobody vouched for this." | `ssh -T` greets you; a commit shows **Verified** on GitHub                   |
| 2 | `1PASSWORD.md`        | "A secret is in the repo." "I'm locked out."                 | `parking/` runs with a secret injected by `op run`; recovery codes are in the vault |
| 3 | `GITHUB-ISSUES.md`    | "Nobody knows what's being worked on, or why, or whether anyone read it." | an issue closed by a reviewed, green, merged pull request that names it |
| 4 | `GITHUB-ACTIONS.md`   | "It works on my machine." "Nobody ran the tests."            | a green run on every push, running the command you run, with the badge           |
| 5 | `DOCKER.md`           | "It works on my machine." "I can't get to a clean state."    | `up --build` from a clean clone; `down -v` returns the seed; you know the architecture |
| 6 | `PACKAGES.md`         | "A different install broke it." "That CVE has been open a year." | a committed lock, an install that refuses drift, one update merged green     |
| 7 | `AGENT.md`            | "Working code nobody can explain."                           | an agent-drafted change you read, ran, signed, and can explain                   |

Two rules for the series, borrowed from the essays:

- **A tool that retires no fear is not essential**, and a document about it should be dropped.
  Each of these names its fear in the first table so you can hold it to that.
- **The fence is not optional.** A green run that could not have been red proves nothing; a setup
  you have not demonstrated is a setup you believe in. Do the fence, then read the next one.

`SHELL.md` is where to start if you have never opened a terminal. `GIT.md` is where to start if you
have.
