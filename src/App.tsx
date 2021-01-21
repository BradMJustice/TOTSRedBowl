import React, { useEffect, useState } from 'react';
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

function App() {

	const [doc, setDoc] = useState<GoogleSpreadsheet>();
	const [responses, setResponses] = useState<GoogleSpreadsheetRow[]>([]);

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
							setResponses(rows);
						}).catch((error) => {
							console.log(error);
						});
				}).catch((error) => {
					console.log(error);
				});
		}
	}, [doc]);

	const rowData = responses?.map((response) => {
		const email = response._rawData[3];

		return <li key={email}>
			{email};
		</li>
	});

	const randomIndex = Math.floor(Math.random() * responses.length);

	const winner = responses[randomIndex];
	const winnerName = `${winner?._rawData[1]} ${winner?._rawData[2]}`;
	const winnerEmail = `${winner?._rawData[3]}`;

	return (
		<div className="App">
			{
				winner &&
				<>
					<ol>
						{rowData}
					</ol>
					<h1>{`Winner: ${winnerName}, ${winnerEmail}`}</h1>
				</>
			}
		</div>
	);
}

export default App;
