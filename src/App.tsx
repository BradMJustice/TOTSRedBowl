import { Col, Row } from 'antd';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import moment from 'moment';
import random from 'random';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { RedBowlResponse } from './Models/Reponse';

const debug = false;

const CenteredCol = styled(Col)`
	text-align: center;
`;

const dateToString = (date: Date): string => {

	const year = date.getFullYear().toString();
	let month = (date.getMonth() + 1).toString();
	if (month.length === 1) {
		month = `0${month}`;
	}
	let day = date.getDate().toString();
	if (day.length === 1) {
		day = `0${day}`;
	}

	return `${year}-${month}-${day}`;
}

function App() {

	const [doc, setDoc] = useState<GoogleSpreadsheet>();
	const [responses, setResponses] = useState<RedBowlResponse[]>([]);
	const [winnerIndex, setWinnerIndex] = useState<number>(-1);
	const [filterDate, setFilterDate] = useState<string>(dateToString(new Date()))
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

							setResponses(parsedResponses);
							setLoading(false);
						}).catch((error) => {
							console.log(error);
						});
				}).catch((error) => {
					console.log(error);
				});
		}
	}, [doc]);

	const cleanResponses = (responses: RedBowlResponse[]): RedBowlResponse[] => {

		//Filter responses to those submitted after 2 hours before curtain
		const dateMoment = moment(filterDate);

		const dayOfWeek = dateMoment.day();
		let minHour: number = 23;

		if (debug) {
			minHour = 0;
		} else if (dayOfWeek === 5 || dayOfWeek === 6) {
			minHour = 17;
		} else if (dayOfWeek === 0) {
			minHour = 12;
		}

		const timeFilteredResponses = responses.filter((r) => {
			const responseMoment = moment(r.date);
			const responseHour = responseMoment.hour();

			const isSameDay = responseMoment.isSame(dateMoment, 'day');
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

	const generateRandomNumber = () => {
		const cleaned = cleanResponses(responses);
		const randomIndex = random.int(0, cleaned?.length - 1);
		console.log(randomIndex);
		setWinnerIndex(randomIndex);
	}

	const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterDate(event.target.value);
	}

	const cleaned = cleanResponses(responses);
	const responseList = cleaned?.map((response) => {
		return <li key={response.email}>
			{response.email};
		</li>
	});

	const winner = winnerIndex !== -1 ? cleaned[winnerIndex] : null;
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
				<CenteredCol>
					<h3>Date Override</h3>
					<p>
						<input
							type="date"
							style={{ width: "200px" }}
							value={filterDate}
							onChange={onDateChange}
						/>
					</p>
				</CenteredCol>
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