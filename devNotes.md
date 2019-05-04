# Dev Notes

Global is a trade logistics game. I'm developing it because I think trade logistics are interesting, and because the types of algorithms and data structures used to solve such problems are good practice for interviewing, and will build my core CS skills.

Example data structures are as follows:
- The core data structure is the Network, which exists as a multigraph allowing multiple bidirectional edges between nodes. The nodes are either Population Centers or Natural Resources, and the edges are trade routes.
- I'm beginning just with rail. Each Population Center (PC) and Natural Resource (NR) has a railyard which serves to support more than one train per PC. What the best data structure to represent this is still TBD, but it's likely to be some sort of branching queue.

Each trade route can have multiple trains on it at the same time, though unless the railyard at the other end has branching capacity for the new train (measured in length), it will be backed up and the second train will need to return to the original station.

Example algorithms are as follows:
- Find the shortest path between two nodes in the Network.
- Generate the NRs and PCs, quantity of edges between them, and demanded resources






Work notes:
- For the time being, I should develop this as JS-only and host on GH pages. Follow this tutorial: https://github.com/gitname/react-gh-pages