# 0.0.8 (1/2/2018) @echopoint

- API Changes:
    *changed autoStart to autogen to be clear of intention. Specifies whether or not to fully generate a new session if one doesn't already exist.
    *sessions are automatically restarted only if they already exist on the client.
    +started property added and applied to current functionality

# 0.0.7 (1/1/2018) @gabrielcsapo 

- Updated usage information and example

# 0.0.6 (1/1/2018) @echopoint

- Removed additional TLS specific naming
- API changes:
      Added autoStart configuration option. If enabled sessions are automatically started, defaults to off
      *start and invalidate no longer requires a connection reference
      +regen: added session regeneration function to user facing api. invalidates old session and starts a new one.

# 0.0.5 (12/28/2017) @echopoint

- Backported, moved to github and published on npm
