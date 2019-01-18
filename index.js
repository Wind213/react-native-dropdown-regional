import React from 'react';
import { StyleSheet, View, AsyncStorage } from 'react-native';
import { Dropdown } from 'rn-material-dropdown'

export default class Regional extends React.Component {
    state = {
        province: [],
        city: [],
        subdistrict: []
    }

    composeData(id, value) {
        return ({ id, value })
    }

    async serveAndCache(url, key, id, index) {
        try {
            storage = await AsyncStorage.getItem(key)
            let data = []
            if (storage !== null) {
                data = JSON.parse(storage || '[]')
                data = data.filter(filtered => filtered[id] === index)
            }
            if (data.length === 0) {
                data = await this.requestJson(url)
                await AsyncStorage.setItem(key, JSON.stringify(data.concat(JSON.parse(storage || '[]'))))
            }
            return data
        } catch (error) {
            throw error
        }
    }

    async requestJson(url) {
        let data = []
        try {
            let response = await fetch(url)
            data = await response.json()
        } catch (error) {
            throw error
        }
        return data
    }

    async componentDidMount() {
        try {
            let data = []

            data = await AsyncStorage.getItem('@Province')

            if (data === null) {
                data = await this.requestJson('http://54.169.19.214:3000/tracking/get/province')
                await AsyncStorage.setItem('@Province', JSON.stringify(data))
            } else {
                data = JSON.parse(data)
            }

            this.setState({
                province: data.map(({ province_id, province }) => this.composeData(province_id, province))
            })
        } catch (error) {
            throw error
        }
    }

    async getCities(index) {
        this.setState({ subdistrict: [], city: [] })
        this.city.setValue('')

        this.subdistrict.setValue('')

        try {
            const data = await this.serveAndCache(`http://54.169.19.214:3000/tracking/get/city/${index}`, '@City', 'province_id', index)
            this.setState({
                city: data.map(({ city_id, city_name }) => this.composeData(city_id, city_name))
            })
        } catch (error) {
            throw error
        }
    }

    async getSubdistrict(index) {
        this.setState({ subdistrict: [] })
        this.subdistrict.setValue('')

        try {
            const data = await this.serveAndCache(`http://54.169.19.214:3000/tracking/get/subdistrict/${index}`, '@Subdistrict', 'city_id', index)
            this.setState({
                subdistrict: data.map(({ subdistrict_id, subdistrict_name }) => this.composeData(subdistrict_id, subdistrict_name))
            })
        } catch (error) {
            throw error
        }
    }

    value() {
        const obj = {
            province: this.province.value(),
            city: this.city.value(),
            subdistrict: this.subdistrict.value()
        }
        return obj
    }

    render() {
        const {
            province,
            city,
            subdistrict,
        } = this.state

        return (
            <View style={styles.container}>
                <Dropdown
                    label='Provinsi'
                    data={province}
                    ref={(ref) => this.province = ref}
                    onChangeText={(value, index, data) => this.getCities(data[index].id)}
                />
                <Dropdown
                    label='Kota'
                    data={city}
                    ref={(ref) => this.city = ref}
                    onChangeText={(value, index, data) => this.getSubdistrict(data[index].id)}
                />
                <Dropdown
                    label='Kecamatan'
                    data={subdistrict}
                    ref={(ref) => this.subdistrict = ref}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
});
