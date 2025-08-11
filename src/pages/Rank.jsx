import React from "react";
import "../styles/rank.css";
import cover from "../images/cover.jpg";

const winners = [
	{
		id: 1,
		avatar: "/images/avatar.png",
		name: "Adam Hollander",
		username: "@HollanderAdam",
		meme: `Jumped on Fox news yesterday.

"So Adam, one I've been hearing a lot about, Pudgy Penguin? I think that one is really popular?"

Love to see it @LucaNetz 👏`,
	
		rank: 1,
		xLink: "https://x.com/your_announcement_post_1",
	},
	{
		id: 2,
		avatar: "/images/avatar.png",
		name: "David Hoffman",
		username: "@TrustlessState",
		meme: `"Ethereum has had ZERO downtime... that's what matters... Wall Street has already decided Ethereum is the chain they're going to build on"

@fundstrat gets it

Uptime, security, confidence is what matters

Ethereum`,
		
		rank: 2,
		xLink: "https://x.com/your_announcement_post_2",
	},
	// ...more winners
];

const Rank = () => {
	return (
		<div style={{  minHeight: "100vh" }}>
			<div className="page-scoll-area">
				<div className="rank-cover-photo">
					<img src={cover} alt="Leaderboard Cover" />
				</div>
				<h1 style={{marginLeft:'30px'}}>Announcement</h1>
				<p style={{marginLeft:'30px'}}> See the winning memes and creators!</p>
				<div className="winner-list">
					{winners.map((winner) => (
						<a
							key={winner.id}
							className="winner-card"
							href={winner.xLink}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="winner-avatar">
								<img src={winner.avatar} alt={winner.name} />
								<span className="winner-rank">#{winner.rank}</span>
							</div>
							<div className="winner-content">
								<div className="winner-header">
									<span className="winner-name">{winner.name}</span>
									<span className="winner-username">{winner.username}</span>
								</div>
								<div className="winner-meme">
									{winner.meme.split("\n").map((line, i) => (
										<div key={i}>{line}</div>
									))}
								</div>
								
							</div>
						</a>
					))}
				</div>
			</div>
		</div>
	);
};

export default Rank;