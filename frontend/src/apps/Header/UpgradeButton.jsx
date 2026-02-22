import { Avatar, Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export default function UpgradeButton() {
  return (
    <Badge count={0} size="small">
      <Button
        type="text"
        icon={<BellOutlined style={{ fontSize: 18 }} />}
        style={{ float: 'right', marginTop: '5px', cursor: 'pointer' }}
      />
    </Badge>
  );
}
