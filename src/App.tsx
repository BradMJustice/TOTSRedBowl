import React, { useEffect, useState } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { RedBowlResponse } from './Models/Reponse';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import random from 'random';
import moment from 'moment';

const debug = false;

const cleanResponses = (responses: RedBowlResponse[]): RedBowlResponse[] => {

	//Filter responses to those submitted after 1 hour before curtain
	const todayMoment = moment(new Date());
	const dayOfWeek = todayMoment.day();
	let minHour: number = 23;

	if (debug) {
		minHour = 0;
	} else if (dayOfWeek === 5 || dayOfWeek === 6) {
		minHour = 18;
	} else if (dayOfWeek === 0) {
		minHour = 13;
	}

	const timeFilteredResponses = responses.filter((r) => {
		const responseMoment = moment(r.date);
		const responseHour = responseMoment.hour();

		const isSameDay = responseMoment.isSame(todayMoment, 'day');
		const isAfterMinHour = responseHour >= minHour

		return isSameDay && isAfterMinHour;
	});

	const dedupedResponses: RedBowlResponse[] = [];

	for (const response of timeFilteredResponses) {
		const existingResponse = dedupedResponses.find((r) => {
			return r.email === response.email;
		});

		if (!existingResponse) {
			dedupedResponses.push(response);
		}
	}

	return dedupedResponses;
};

const CenteredCol = styled(Col)`
	text-align: center;
`;

function App() {

	const [doc, setDoc] = useState<GoogleSpreadsheet>();
	const [responses, setResponses] = useState<RedBowlResponse[]>([]);
	const [winnerIndex, setWinnerIndex] = useState<number>(-1);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		setDoc(new GoogleSpreadsheet('1OEry52CfvOobIL9hjQGPOCl0ncIMF_KHrtY4glougLE'));
	}, []);

	useEffect(() => {
		if (doc) {
			doc.useApiKey("AIzaSyCOrD6IBVG0UHiFANoaHMStiZXN8bYsqV8");

			doc.loadInfo()
				.then((response) => {
					const sheet = doc?.sheetsByIndex[0];
					sheet?.getRows()
						.then((rows) => {
							const parsedResponses = rows.map((r) => {
								const date = r._rawData[0];
								const firstname = r._rawData[1];
								const lastname = r._rawData[2];
								const email = r._rawData[3];
								const returnResponse = new RedBowlResponse(date, firstname, lastname, email);

								return returnResponse;
							});

							const cleaned = cleanResponses(parsedResponses);
							setResponses(cleaned);
							setLoading(false);
						}).catch((error) => {
							console.log(error);
						});
				}).catch((error) => {
					console.log(error);
				});
		}
	}, [doc]);

	const generateRandomNumber = () => {
		const randomIndex = random.int(0, responses?.length - 1);
		console.log(randomIndex);
		setWinnerIndex(randomIndex);
	}

	const responseList = responses?.map((response) => {
		return (
			<li key={response.email}>
				{response.email};
			</li>
		)
	});

	const winner = winnerIndex !== -1 ? responses[winnerIndex] : null;
	const winnerName = `${winner?.firstname} ${winner?.lastname}`;
	const winnerEmail = `${winner?.email}`;

	const topContentIfLoaded = responses?.length > 0
		? <button
			onClick={generateRandomNumber}
			style={{
				width: "50%",
				height: "5em"
			}}>
			Randomly select winner
			</button>
		: <h1>No entries yet!</h1>

	const topContent = loading
		? <h2>Loading, please wait</h2>
		: topContentIfLoaded;

	return (
		<div className="App">
			<Row>
				<Col>
					<h1 style={{ textAlign: "center" }}>
						TOTS Red Bowl
					</h1>
				</Col>
			</Row>
			<Row>
				<CenteredCol span={24}>
					{topContent}
				</CenteredCol>
			</Row>
			{
				winner &&
				<div style={{ color: "red" }}>
					<Row>
						<CenteredCol span={24}>
							<h1>Winner:</h1>
						</CenteredCol>
					</Row>
					<Row>
						<CenteredCol span={24}>
							<h3>{`${winnerName}, ${winnerEmail}`}</h3>
						</CenteredCol>
					</Row>
				</div>
			}
			<Row>
				<Col span={24}>
					<ol>
						{responseList}
					</ol>
				</Col>
			</Row>
		</div>
	);
}

export default App;
