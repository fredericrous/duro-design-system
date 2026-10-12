import {ScrollView} from 'react-native'
import {AllExports} from '../src/AllExports'

export default function Index() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <AllExports />
    </ScrollView>
  )
}
