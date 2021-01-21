import React, { useEffect, useState } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { RedBowlResponse } from './Models/Reponse';
import { Col, Row } from 'antd';
import styled from 'styled-components';

const dedupeResponses = (responses: RedBowlResponse[]): RedBowlResponse[] => {
	const dedupedResponses: RedBowlResponse[] = [];

	for (const response of responses) {
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

							const deduped = dedupeResponses(parsedResponses);
							setResponses(deduped);
						}).catch((error) => {
							console.log(error);
						});
				}).catch((error) => {
					console.log(error);
				});
		}
	}, [doc]);

	const generateRandomNumber = () => {
		const randomIndex = Math.floor(Math.random() * responses.length);
		console.log(randomIndex);
		setWinnerIndex(randomIndex);
	}

	const responseList = responses?.map((response) => {
		return <li key={response.email}>
			{response.email};
		</li>
	});

	const winner = winnerIndex !== -1 ? responses[winnerIndex] : null;
	const winnerName = `${winner?.firstname} ${winner?.lastname}`;
	const winnerEmail = `${winner?.email}`;

	return (
		<div className="App">
			<Row>
				<CenteredCol span={24}>
					<h2>List of entries can be found below</h2>
				</CenteredCol>
			</Row>
			<Row>
				<CenteredCol span={24}>
					{
						responses?.length > 0 &&
						<button onClick={generateRandomNumber}>Randomly select winner</button>
					}
				</CenteredCol>
			</Row>
			<Row>
				<CenteredCol span={24}>
					{
						winner &&
						<>
							<h1>{`Winner: ${winnerName}, ${winnerEmail}`}</h1>
						</>
					}
				</CenteredCol>
			</Row>
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
