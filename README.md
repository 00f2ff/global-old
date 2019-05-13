# Global

Global is a trade logistics game. I'm developing it because I think trade logistics are interesting, I want to learn React, and because developing the game will build my core CS skills.

Example data structures are as follows:
- The core data structure is the Network, which exists as a multigraph allowing multiple bidirectional edges between nodes. The nodes are either Population Centers or Natural Resources, and the edges are trade routes.
- I'm beginning just with rail. Each Population Center (PC) and Natural Resource (NR) has a railyard which serves to support more than one train per PC. What the best data structure to represent this is still TBD, but it's likely to be some sort of branching queue.

Each trade route can have multiple trains on it at the same time, though unless the railyard at the other end has branching capacity for the new train (measured in length), it will be backed up and the second train will need to return to the original station.

Example algorithms are as follows:
- Find the shortest path between two nodes in the Network.
- Generate the NRs and PCs, quantity of edges between them, and demanded resources


In the short term, this should just save to localStorage. 

Enhancement to padding in point-setting: create buffers around locations that can't have other points be dropped in. I bet I can find some algorithm that fills available space minus existing areas.
I think this is what bounding box collision detection is.
Check the canvas library I'm using to see if it uses a centerpoint or a top-left
https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection 

there may be an enhancement for path-finding that connects every NR to a particular PC that wants it, and then prunes

algo practice: study how Dijkstra's works. I think I have the gist of it, but putting it into practice is tricky

Each PC begins by connecting to goods-1 NRs
If we find that a PC _could_ have a direct connection to an NR, still have it route through another city
 - In the future, players can petition to build rail between the NR and the PC as a direct line

A big refactor todo will be to add network helpers that can filter to find keys of a particular type
 - this avoids needing to search through PCs or NRs as the prior list, which extends my ability to call algos 
   for other purposes

## To do:


### Map Generation
- [x] Add edges to connect each PC to one NR for each of the PC's demanded resources, at random, but limited based on the size of each NR/PC -- this may lead to a disconnected graph (can test for it visually)
- [x] Add edges between PCs and NRs for each demanded resource, but connect the closest of each NR to that PC
- [x] Find the shortest path to each NR for each resource demanded by a PC, even if that means NR-PC-PC
  - Can implement Dijkstra's Algorithm to do so
	- Analyze whether this results in multiple edges between PCs, which is ok and may be preferable / more interesting
- [x] I think 0.0.4 and 0.0.5 should be satisfied by an appropriate multigraph build from Dijkstra's
  - There was the good point about making sure smaller PCs aren't passed by, but I think that's resolved by ensuring every PC connects with an NR, even if indirectly
### Market
- [ ] Scale demand axis as a proximity function, where the farther a PC is from a NR, the more it is willing to pay
- [ ] Research and implement a pseudo-random function that fluctuates demand on a per-PC basis.
- [ ] Refactor demand function to accept a +/- across all PCs for future global event simulation
  - Events may include things like reduction in NR availability (e.g. mining accident) 
### Gameplay -- use redux for interactivity and state
Ideas:
- The bigger a PC is, the more _quantity_ it will look for of a good
- When a PC gets too much of a resource, that depresses how much it's willing to pay
- Add proper naming to things (randomized, but have it make sense)
- Implement Freight Forwarders first
 - For starters, assume infinite supply/demand quantity, limit of one train per edge
 - Goods will travel via setTimeout, though I may want to inject routes into a global setInterval that performs checks
 - First NR-PC routes, but later multi-location routing driven by Dijktra's
- PC size boosting as more goods flow through it
- Add more resource types and prices
  - Also manufacturing, so resources to one PC will cause PC to produce a different kind of resource
- Introduce space-constrained trains 
  - Measure quantity of goods according to how many containers they fill on a train car
- Size-constrained railway depots + ability for PCs to build more infrastructure
- Visualize the graph
- Players can petition government to purchase rail between two locations that are not directly connected
- Design a compelling UI
- Consider changing how NR edges are determined (i.e. if size is medium, both edges may go to a single PC)
- Consider relaxing map generation algorithm to give slight distance handicap when considering a connection to a small PC
- Implement carriers
	- Enhanced train logic, such as newer / more locomotives and customization of trains
- Introduce events that affect how long it takes for a train to reach a destination, or if a station takes longer for loading / unloading
	- E.g. if there's a machinery breakdown, a PC's load time may double; if there's a strike and a sentiment check on the PC makes it sound like it will go on for a while, freight forwarders can route through different PCs
- Introduce events where new resources are found (e.g. oil discovery, etc)
- Corporate research
 - Efficiency gains are clearer for carriers (faster trains, improved refridgeration, etc)
 - Locations (so government research) could benefit from improved switching
 - Carriers could improve load/unload technology for faster turnaround
 - More advanced financial modeling provided for player (kind of like a mini Bloomberg terminal)
 - Automated routing of varying degrees of usefulness
- Enhanced visualization for players to see which routes are revenue/profit-generating, and which aren't
- Add full container load (FCL) and less-than container load (LCL) rate options for freight forwarders
- Implement bonds and loans
 - Bonds could be low-interest and issued by individual PCs, and come with expectation that a certain amount of CapEx will be dedicated toward enhancing presence in that PC
 - Loans could be mid-to-high-interest and issued by banks, and come with geographic flexibility
- Multiple trains per edge (this requires advanced routing)
 - e.g. perhaps a track has a switch implemented in the middle of a route (case of fast/slow train, or trains heading toward one another). If this happens, potentially in the future a small PC could crop up there

Notes from Scala:
/*
  Multiple edges into a PC are considered as heading into a single depot.

  Edge creation:
   - I'll need a length function at some point. Initially it will just be linear, though at some point it needs to capture
     geographic features, and I need to decide whether any curve tolerances will be introduced
   - I'm going to want a graph visualization tool to make sure this is working (visual checking will be easier than with code,
     though test code should be present too). A static cytoscape encoding is probably worth it (use what we are in runtime for
     work)

  0.0.1 rail: size of PC tracks with how many edges it has. Resources picked are random, but 1 per edge
  so no duplicates yet
  0.0.2 rail: number of edges to a PC is a proximity function, but is limited by size. Not necessarily 1 per edge, nor
  random picking
  0.0.3 rail: edges are a proximity function, with a depth-first approach to connecting PCs together, based on demand.
              Update: what does this mean? Presumably PCs are connected together, but is that based on closer resources?
  0.0.4 rail: 0.0.3 + size indicating parallel edges to other PCs in all instances (removing disjoint nodes).
  0.0.5 rail: 0.0.4 + There should not be full connectivity, so some restrictions need to be placed to make sure not all PCs connect. I think
  parallel edges should still be a proximity function, so think about geometries in which smaller PCs can be added to a
  route rather than passed by (e.g. length <= - [x]2 of original length to include). This could increase the number of edges
  to a PC beyond its city size, which is fine.
   */

  /*
  Once the initialized map is in a good spot, it will be time to create the market. I think PCs themselves shouldn't
  store market data, but rather a potentially mutating object does for each PC and resource.
  Market 0.0.1: If this design holds, an object leveraged in a game loop that changes demand pricing for each PC by randomly selecting with a Vector. This requires a change to Global to include a main() method
  Market 0.0.2: Establish a value for each resource, and change demand pricing to be along a quotient axis to establish rate
  Market 0.0.3: Scale demand axis as a proximity function, where the farther a PC is from a NR, the more it is willing to pay
  Market 0.0.4: Research and implement a randomized function that fluctuates demand on a per-PC basis.
  Market 0.0.5: Refactor demand function to accept a +/- across all PCs for future global event simulation

  thought:
   - consider introducing a tiling system that will change demand for all PCs within a tile
   - Market 0.0.4+ might make sense to write in JavaScript, and to introduce live charts for demand in different PCs.
     It's conceivable that at this point in time I'll need to switch to design and development of the frontend. I think
     React is still the way to go, I'll just need to deal with the learning curve
 */

 // todo: in refactor, Route should support multiple transportation sources, e.g. a railway can have multiple trains on it,
// and a road multiple trucks, and a sea route multiple ships
// What matters is that there is rail capacity at the other end to offload trains such that there are not conflicts, and
// that the lengthwise capacity also supports the trains (e.g. if 2 100 foot trains arrive and there's only 50 feet of
// side rail, the second one will be stuck
// At present time, routes are assumed to be straight lines. In future, geography may require pathfinding algorithms that
// can do things like wrap railways and highways

Random thoughts:
- I'm curious whether a k-d tree would be useful to evaluate different pathfinding options
- Look into Cytoscape.js for frontend vis. It shouldn't be interactive per se, but may be worth using for graph visualization
  - That said, perhaps when actors can add infrastructure, an interactive graph can be used to establish the best placement
    with updating variables

Visualization engine
- I think a customized SVG engine may be the way to go. Cytoscape might be ok, but the background is contextually relevant,
  and needs to impact how the vertices appear visually. The tool is not designed for that. SVG on the other hand, can
  support custom line art and fills, which will be useful and referenceable
- Something to consider (likely too advanced, but I also don't know how to create topology maps and I want to keep this 2D)
  https://www.reddit.com/r/proceduralgeneration/comments/99028e/island_generation_process_video/
  This is a little more informative: http://www-cs-students.stanford.edu/~amitp/game-programming/polygon-map-generation/
  Another: https://heredragonsabound.blogspot.com/2016/10/making-islands.html
  Look into continent builders, and figure out scale factors (i.e. how far away things are) in a consistent manner
  When I introduce sea and air routes, continents that historically would be choked of resources can demand them from other
  places.
  This is a goldmine as well for tutorials https://www.redblobgames.com/
  I'm interested what he means by "annotate". I might mean weighting edges in a graph differently to suggest something like
  change in elevation, which I could use to indicate things like port depth, oceans, mountains and plains
  This tutorial has a last section on all the different game things that can be represented with graphs, and therefore use
  graph algos: https://www.redblobgames.com/pathfinding/grids/graphs.html it's super useful and interesting to think about!


  https://www.redblobgames.com/pathfinding/grids/graphs.html

	* todo: there are a lot of enhancements we can do when we refactor. For instance, a train could consist of multiple
    * cars encapsulated by a list, and there may be more than one locomotive

  /*
The value of Goods may not matter. However, different carriers/forwarders could charge different rates based on a good,
or a flat rate, so perhaps that option should be left open.

Similarly, there are considerations about full container load (FCL) and less-than container load (LCL) rates
 */

 todo: add refinements to oil and steel (and aluminum if necessary)




Work notes:
- For the time being, I should develop this as JS-only and host on GH pages. Follow this tutorial: https://github.com/gitname/react-gh-pages