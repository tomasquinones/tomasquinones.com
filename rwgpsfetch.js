// Fetches userid and other info from a signed-in account at Ride with GPS. 

const testParam = window.location.search;
const searchParams = new URLSearchParams(testParam);
let user_id = searchParams.get("user_id");
let printUserID = document.querySelector(".user_id");

let email = searchParams.get('email');
let password = searchParams.get('password');




// if (isNaN(user_id)) {
//     printUserID.textContent = "Not a valid user_id parameter";
// } else {
//     printUserID.textContent = user_id;
// }


const userInfoList = document.querySelector("#userInfoList");
const currentUserRequest = new Request(`https://ridewithgps.com/users/current.json?apikey=x&apiversion=3&email=${email}&password=${password}`);

    fetch(currentUserRequest)
        .then((response) => response.json())
        .then((userData) => {
            console.log(userData);
            const userName = document.querySelector(".userName");
            userName.textContent = "Name: " + userData.user.name;

            // const listItemId = document.createElement("li");
            // listItemId.textContent = userData.user.id;
            // userInfoList.appendChild(listItemId);

            const gearList = document.querySelector(".gearList");
            for (const bike of userData.user.gear) {
                const gearListItem = document.createElement("li");
                gearListItem.textContent = bike.name;
                gearList.appendChild(gearListItem);
            }

            for (const bike of userData.user.gear) {
                const listItemGear = document.createElement("li")

                listItemGear.textContent = bike.name;
                userInfoList.append(listItemGear);

                //new Request to get the Career stats
                // example https://ridewithgps.com/users/807463/career_stats.json?apikey=x&interval=month&interval_value=2021-03
            }
            const statsRequest = new Request(`https://ridewithgps.com/users/${userData.user.id}/career_stats.json?apikey=x&apiversion=3&auth_token=${userData.user.auth_token}`);

            fetch(statsRequest)
                .then((response) => response.json())
                .then((statsData) => {
                    console.log(statsData)//stats here

                    const listItemYearlyStats = document.createElement("li");
                    listItemYearlyStats.textContent = `Career Miles ${statsData.distance * 0.000621371}`; //put meters to miles value in const 0.000621371
                    userInfoList.appendChild(listItemYearlyStats);
                })

                const ridesRequest = new Request(`https://ridewithgps.com/explore/personal.json?models=trips&sort_by=departed_or_created+DESC&trip_fields=id%2Cname%2Cdistance%2Celevation_gain&user_id=${userData.user.id}
apikey=x&apiversion=3&email=${email}&password=${password}`);
                fetch(ridesRequest)
                .then((response) => response.json())
                .then((ridesData) => {
                    console.log(ridesData)
                    for (const ride of ridesData.results.trips){
                        console.log(ride[1])
                    }
                })
            }) 