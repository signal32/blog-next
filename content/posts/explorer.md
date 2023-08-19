---
name: "Explorer - An Open Geospatial Data Browser"
created: '12 May 2022'
slug: explorer
coverImage: "/graphics/posts/explorer_app_demo.jpg"
excerpt: "As part of my computing science degree, I created a mobile application to improve access to geospatial information on WikiData. This post describes the problem, my solution, and the results of its implementation."
---

As part of my computing science degree, I created a mobile application to improve access to geospatial information on WikiData. This post describes the problem, my solution, and the results of its implementation.
<br><br>
Try the application here: [explore.hamishweir.uk](https://explore.hamishweir.uk)

Source code available on [GitHub](https://github.com/signal32/explorer).
<br><br>
***Note:** This post is extracted from, and references figures within, the poster shown below.*

# Introduction
The general public are unable to utilise Geospatial Open Data on WikiData due to a skill and knowledge gap. Explorer is a novel mobile application which aims to increase the general public accessibility of Geospatial Open Data. The application was designed to run on any mobile device within a web browser. It uses Semantic Web technologies to reason about data on WikiData, and uses this to provide discovery features. A user study finds that the application is useful and users enjoy discovering information from WikiData, although it is not always relevant to them. Some data accuracy issues with WikiData are also highlighted.


# Background
Many organisations publish Open Geospatial Data which can be used freely by third parties to understand geographic features.  However, a lack of skills and knowledge restrict its use by the general public and incompatible storage formats prevent effective use by app developers [1].
Semantic Web technologies reduce technological barriers to knowledge sharing by representing information within Knowledge Graphs which developers can query using standardised protocols [2].
WikiData is a Knowledge Base of Open Data maintained by Wikimedia. It is widely regarded as a machine readable version of Wikipedia and has been growing steadily since its inception in 2012 (Fig 2). It contains geospatial information of over 9 million distinct places [3].
Explorer aims to use WikiData to improve the intellectual accessibility of Open Geospatial Data to the general public. 

## Objectives
1.	Improve the intellectual accessibility of Open Geospatial Data
2.	Evaluate WikiData for geospatial entity detail provision and recommendation
3.	Explore how Open Data applications can provide modularity and extensibility
4.	Promote open data and open source software development

# Implementation
Web technologies enable seamless cross platform support, Explorer is built as a Progressive Web App using the latest Vue3 and Ionic frameworks. 
An extensible architecture (Fig. 3) makes use of plugins to extend domain specific business logic of each feature. 
Relevant recommendations (Fig. 5) are provided by analysing relationships in WikiData's Knowledge Graph.
Context specific detailed information (Fig. 2) is sourced by plugins that understand the Knowledge Graph.
Categorisation of places using WikiData allows rich category information such icons (A4) to be shown.
Place Preferences (Fig. 1) use the Knowledge Graph structure to show places only of certain categories. Users can search from thousands of categories to suit their needs. Unwanted place types can be hidden (A3)

# Analysis
## Design 
An online survey and in-person focus group sessions evaluated the apps usability and utility with the target audience.
18 respondents to the online survey provided quantitative data based on the System Usability Scale. A semi-structured interview with focus group members helped explain this data.

## Results
![alt text](/graphics/posts/explorer/system_usability_scale.svg "Logo Title")
*Figure 6: Response to usability questions*

The user study  showed positive sentiment towards the application (Figure 2).  One participant commented how they  "hate going to new  places and not knowing where to explore [or] what to do" and that the app "takes the distraction away and focuses on actual activities".
Users overwhelmingly agreed that the app was easy to use, commenting that they "like how minimal it is" while "information [is] nicely presented geographically". Two thirds reported that would enjoy using the app frequently. 

![alt text](/graphics/posts/explorer/explorer_stats.svg "Logo Title") 
*Figure 7, 8: Showing time within app and overall user sentiment*

Users found the app useful. One user, explaining recommendations, said
"I go down the rabbit hole, [and think] oh this is cool, this is connected to this".

# Conclusion 
1.	Feedback from users positively confirms that Explorer improves intellectual accessibility of WikiData's geospatial data.
2.	The system provided utility to participants, indicated by their enjoyment and willingness to use it again. 
3.	Extenisibility is achievable by using a plugin based architecture, which was practical and efficient.
4.	It is possible to build a Knowledge Base backed maps application for end users using only open-source data and technologies.

## Future Work
- Explore improved recommendations using Knowledge Graph embeddings
-	Support user submitted plugins for custom functionality.
-	Develop integrations with third party sources for additional detailed info

## Poster
![alt text](/graphics/posts/explorer/explorer_poster.png "Logo Title")
Download poster as [PDF](/documents/explorer_poster.pdf)